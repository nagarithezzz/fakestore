import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.exceptions.custom_exceptions import AppHTTPException
from app.models.cdr import CDRType
from app.services.cdr_service import CDRService


class TestCDRService(unittest.TestCase):
    def _service(self):
        s = CDRService.__new__(CDRService)
        s._db = Mock()
        s._cdr = Mock()
        s._users = Mock()
        return s

    def test_add_record_raises_when_user_missing(self):
        service = self._service()
        service._users.get_by_id.return_value = None

        with self.assertRaises(AppHTTPException) as err:
            service.add_record(
                user_id="507f1f77bcf86cd799439011",
                cdr_type=CDRType.call,
                duration=60,
                data_used=0.0,
                destination_number="9000000000",
                timestamp=datetime.now(timezone.utc),
            )

        self.assertEqual(err.exception.status_code, 404)
        self.assertEqual(err.exception.detail, "User not found")
        service._cdr.create.assert_not_called()

    def test_add_record_raises_for_invalid_call_duration(self):
        service = self._service()
        service._users.get_by_id.return_value = object()

        with self.assertRaises(AppHTTPException) as err:
            service.add_record(
                user_id="507f1f77bcf86cd799439011",
                cdr_type=CDRType.call,
                duration=-1,
                data_used=0.0,
                destination_number="9000000000",
                timestamp=None,
            )

        self.assertEqual(err.exception.status_code, 400)
        self.assertEqual(err.exception.detail, "Invalid duration")
        service._cdr.create.assert_not_called()

    def test_add_record_raises_for_invalid_data_usage(self):
        service = self._service()
        service._users.get_by_id.return_value = object()

        with self.assertRaises(AppHTTPException) as err:
            service.add_record(
                user_id="507f1f77bcf86cd799439011",
                cdr_type=CDRType.data,
                duration=0,
                data_used=-0.01,
                destination_number=None,
                timestamp=None,
            )

        self.assertEqual(err.exception.status_code, 400)
        self.assertEqual(err.exception.detail, "Invalid data_used")
        service._cdr.create.assert_not_called()

    def test_add_record_passes_valid_payload_to_repository(self):
        service = self._service()
        service._users.get_by_id.return_value = object()
        service._cdr.create.return_value = {"id": "rec1"}
        ts = datetime(2026, 3, 1, tzinfo=timezone.utc)
        uid = "507f1f77bcf86cd799439011"

        result = service.add_record(
            user_id=uid,
            cdr_type=CDRType.sms,
            duration=1,
            data_used=0.0,
            destination_number="9000000001",
            timestamp=ts,
        )

        self.assertEqual(result, {"id": "rec1"})
        service._cdr.create.assert_called_once_with(
            user_id=uid,
            cdr_type=CDRType.sms,
            duration=1,
            data_used=0.0,
            destination_number="9000000001",
            timestamp=ts,
        )


if __name__ == "__main__":
    unittest.main()
