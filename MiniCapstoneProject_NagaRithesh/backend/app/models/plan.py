from dataclasses import dataclass


@dataclass
class Plan:
    id: str
    name: str
    call_rate: float
    sms_rate: float
    data_rate: float
