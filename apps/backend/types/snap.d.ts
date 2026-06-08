interface SnapResult {
    order_id: string;
    transaction_status: string;
    payment_type: string;
    status_code: string;
}

interface Window {
    snap?: {
        pay(
            token: string,
            options: {
                onSuccess?: (result: SnapResult) => void;
                onPending?: (result: SnapResult) => void;
                onError?: (result: SnapResult) => void;
                onClose?: () => void;
            }
        ): void;
    };
}
