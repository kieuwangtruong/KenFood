from pydantic import BaseModel

class PayOSWebhookData(BaseModel):
    orderCode: int
    amount: int
    description: str
    accountNumber: str | None = None
    reference: str | None = None
    transactionDateTime: str | None = None
    currency: str = "VND"
    paymentLinkId: str
    code: str
    desc: str

class PayOSWebhookPayload(BaseModel):
    success: bool
    data: PayOSWebhookData
    signature: str
