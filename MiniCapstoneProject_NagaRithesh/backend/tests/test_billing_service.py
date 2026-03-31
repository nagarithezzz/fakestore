import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.exceptions.custom_exceptions import AppHTTPException
from app.models.billing import BillingStatus
from app.models.cdr import CDRType
from app.services.billing_service import BillingService


class TestBillingService(unittest.TestCase):
    def _service(self):
        s = BillingService.__new__(BillingService)
        s._db = Mock()
        s._billing = Mock()
        s._cdr = Mock()
        s._users = Mock()
        s._plans = Mock()
        return s

    def test_compute_total_for_call_sms_data(self):
        service = self._service()
        records = [
            SimpleNamespace(type=CDRType.call, duration=10, data_used=0.0),
            SimpleNamespace(type=CDRType.sms, duration=0, data_used=0.0),
            SimpleNamespace(type=CDRType.data, duration=0, data_used=1.25),
        ]
        plan = SimpleNamespace(call_rate=0.5, sms_rate=0.1, data_rate=0.01)

        total = service._compute_total(records, plan)

        self.assertEqual(total, 5.11)

    def test_cycle_bounds_for_december_rollover(self):
        service = self._service()
        start, end = service._cycle_bounds("2026-12")

        self.assertEqual(start, datetime(2026, 12, 1, tzinfo=timezone.utc))
        self.assertEqual(end, datetime(2027, 1, 1, tzinfo=timezone.utc))

    def test_generate_bill_raises_for_missing_user(self):
        service = self._service()
        service._users.get_by_id.return_value = None

        with self.assertRaises(AppHTTPException) as err:
            service.generate_bill(user_id="507f1f77bcf86cd799439011", billing_cycle="2026-03")

        self.assertEqual(err.exception.status_code, 404)
        self.assertEqual(err.exception.detail, "User not found")

    def test_generate_bill_updates_existing_bill(self):
        service = self._service()

        user = SimpleNamespace(id="u1", plan_id="p1")
        plan = SimpleNamespace(call_rate=1.0, sms_rate=1.0, data_rate=1.0)
        records = [SimpleNamespace(type=CDRType.call, duration=10, data_used=0.0)]
        existing = SimpleNamespace(id="b1", total_amount=0.0)
        updated = SimpleNamespace(id="b1", total_amount=10.0)

        service._users.get_by_id.return_value = user
        service._plans.get_by_id.return_value = plan
        service._cdr.list_by_user_in_cycle.return_value = records
        service._billing.get_by_user_cycle.return_value = existing
        service._billing.update_total.return_value = updated

        result = service.generate_bill(user_id="u1", billing_cycle="2026-03")

        self.assertIs(result, updated)
        self.assertEqual(result.total_amount, 10.0)
        service._billing.update_total.assert_called_once_with("b1", 10.0)
        service._billing.create.assert_not_called()

    def test_pay_bill_marks_pending_bill_as_paid(self):
        service = self._service()
        bill = SimpleNamespace(id="5", user_id="1", status=BillingStatus.pending)
        service._billing.get_by_id.return_value = bill
        service._billing.update_status.return_value = bill

        result = service.pay_bill(billing_id="5", user_id="1")

        self.assertIs(result, bill)
        service._billing.update_status.assert_called_once_with(bill, BillingStatus.paid)

    def test_pay_bill_rejects_wrong_owner(self):
        service = self._service()
        service._billing.get_by_id.return_value = SimpleNamespace(
            id="5", user_id="2", status=BillingStatus.pending
        )

        with self.assertRaises(AppHTTPException) as err:
            service.pay_bill(billing_id="5", user_id="1")

        self.assertEqual(err.exception.status_code, 403)
        self.assertEqual(err.exception.detail, "Not your bill")


if __name__ == "__main__":
    unittest.main()
