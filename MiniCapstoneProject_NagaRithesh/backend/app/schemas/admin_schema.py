from pydantic import BaseModel


class AdminReportsOut(BaseModel):
    total_users: int
    total_cdr_records: int
    total_revenue_paid: float
    total_revenue_pending: float
    total_bills: int
