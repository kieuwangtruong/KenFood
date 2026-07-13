import hmac
import hashlib
from payos import PayOS
from app.config import settings

# Initialize PayOS Client
payos_client = PayOS(
    client_id=settings.PAYOS_CLIENT_ID,
    api_key=settings.PAYOS_API_KEY,
    checksum_key=settings.PAYOS_CHECKSUM_KEY
)

class PayOSService:
    @staticmethod
    def verify_webhook_signature(data: dict, signature: str) -> bool:
        """
        Cryptographically verifies the webhook payload signature using the PayOS Checksum Key.
        1. Sort the keys of the data dictionary alphabetically.
        2. Format into key1=value1&key2=value2...
        3. Compute HMAC-SHA256 signature and verify with hmac.compare_digest.
        """
        # Sort keys of data object alphabetically
        sorted_keys = sorted(data.keys())
        
        # Build query string
        query_string_parts = []
        for key in sorted_keys:
            val = data[key]
            # Convert boolean to lowercase string, None to empty, etc.
            if val is None:
                val_str = ""
            elif isinstance(val, bool):
                val_str = str(val).lower()
            else:
                val_str = str(val)
            query_string_parts.append(f"{key}={val_str}")
            
        query_string = "&".join(query_string_parts)
        
        # Compute HMAC-SHA256
        calculated_signature = hmac.new(
            settings.PAYOS_CHECKSUM_KEY.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(calculated_signature, signature)

    @staticmethod
    async def create_payment_link(order_code: int, amount: int, description: str):
        """
        Generates a PayOS Checkout URL for wallet deposits or orders.
        """
        # Fallback for local development with default mock credentials
        if settings.PAYOS_CLIENT_ID == "your_payos_client_id" or "your_payos" in settings.PAYOS_CLIENT_ID:
            class MockResponse:
                def __init__(self):
                    self.checkoutUrl = f"https://mock.payos.vn/checkout/{order_code}"
            return MockResponse()

        from payos.type import PaymentData
        
        payment_data = PaymentData(
            orderCode=order_code,
            amount=amount,
            description=description[:25], # PayOS description is max 25 chars
            cancelUrl=settings.PAYOS_CANCEL_URL,
            returnUrl=settings.PAYOS_RETURN_URL
        )
        
        # We run the synchronous SDK call in a thread pool to avoid blocking async event loop
        import anyio
        response = await anyio.to_thread.run_sync(
            payos_client.createPaymentLink, payment_data
        )
        return response
