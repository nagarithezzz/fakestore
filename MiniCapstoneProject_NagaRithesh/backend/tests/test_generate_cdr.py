import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.cdr import CDRType
from scripts.generate_cdr import generate_for_users, random_cdr, random_mobile


class TestGenerateCDRScript(unittest.TestCase):
    def test_random_mobile_is_10_digit_and_starts_with_9(self):
        import random

        value = random_mobile(random.Random(7))
        self.assertEqual(len(value), 10)
        self.assertTrue(value.startswith("9"))
        self.assertTrue(value.isdigit())

    def test_random_cdr_call_shape(self):
        class FixedRng:
            def choice(self, _):
                return CDRType.call

            def randint(self, a, b):
                return 3 if (a, b) == (0, 60 * 24 * 30) else 120

        now = datetime(2026, 3, 31, tzinfo=timezone.utc)
        cdr = random_cdr(user_id=1, rng=FixedRng(), now=now)

        self.assertEqual(cdr.cdr_type, CDRType.call)
        self.assertEqual(cdr.duration, 120)
        self.assertEqual(cdr.data_used, 0.0)
        self.assertIsNotNone(cdr.destination_number)

    def test_random_cdr_data_shape(self):
        class FixedRng:
            def choice(self, _):
                return CDRType.data

            def randint(self, a, b):
                return 0

            def uniform(self, a, b):
                return 2.345

        cdr = random_cdr(
            user_id=2,
            rng=FixedRng(),
            now=datetime(2026, 3, 31, tzinfo=timezone.utc),
        )

        self.assertEqual(cdr.cdr_type, CDRType.data)
        self.assertEqual(cdr.duration, 0)
        self.assertEqual(cdr.data_used, 2.35)
        self.assertIsNone(cdr.destination_number)

    @patch("scripts.generate_cdr.CDRService")
    def test_generate_for_users_creates_records_for_each_user(self, service_cls):
        db = Mock()
        db.execute.return_value.scalars.return_value.all.return_value = [10, 20]
        service = Mock()
        service_cls.return_value = service

        created = generate_for_users(db=db, records_per_user=3, seed=1)

        self.assertEqual(created, 6)
        self.assertEqual(service.add_record.call_count, 6)
        first_call = service.add_record.call_args_list[0].kwargs
        self.assertEqual(first_call["user_id"], 10)


if __name__ == "__main__":
    unittest.main()
