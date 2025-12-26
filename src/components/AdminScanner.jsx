import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const AdminScanner = ({ onClose }) => {
    const [scanResult, setScanResult] = useState(null); // { status: 'success'|'error', message, data }
    const [scanning, setScanning] = useState(true);
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initialize Scanner
        // Use Html5QrcodeScanner for built-in UI or Html5Qrcode for custom
        // Using Scanner for speed
        const scannerId = "reader";

        const onScanSuccess = async (decodedText, decodedResult) => {
            // Pause scanning
            if (scannerRef.current) {
                scannerRef.current.pause();
            }
            setScanning(false);

            try {
                // Call API
                const response = await api.post('visitor/registrations/verify-qr/', { qr_token: decodedText });
                setScanResult({
                    status: 'success',
                    message: response.data.message,
                    data: response.data.registration
                });
            } catch (error) {
                setScanResult({
                    status: 'error',
                    message: error.response?.data?.error || 'Verification Failed',
                    data: null
                });
            }
        };

        const onScanFailure = (error) => {
            // Handle scan failure, usually better to ignore frame errors
            // console.warn(`Code scan error = ${error}`);
        };

        if (scanning && !scanResult) {
            scannerRef.current = new Html5QrcodeScanner(
                scannerId,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            scannerRef.current.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [scanning, scanResult]);

    const handleReset = () => {
        setScanResult(null);
        setScanning(true);
        // Re-init happens in useEffect
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm flex flex-col items-center">
                <h3 className="font-bold text-xl mb-4">Scan Visitor QR</h3>

                {!scanResult ? (
                    <div id="reader" style={{ width: '100%', minHeight: '300px' }}></div>
                ) : (
                    <div className="text-center w-full">
                        {scanResult.status === 'success' ? (
                            <div className="text-green-600 mb-4">
                                <CheckCircle className="h-16 w-16 mx-auto mb-2" />
                                <h4 className="font-bold text-lg">Check-in Successful</h4>
                                <p className="text-sm text-gray-600">{scanResult.message}</p>
                                <div className="mt-4 p-4 bg-green-50 rounded text-left">
                                    <p><strong>Visitor ID:</strong> {scanResult.data?.id}</p>
                                    <p><strong>Event:</strong> {scanResult.data?.exhibition_details?.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-600 mb-4">
                                <XCircle className="h-16 w-16 mx-auto mb-2" />
                                <h4 className="font-bold text-lg">Check-in Failed</h4>
                                <p className="text-sm text-gray-600">{scanResult.message}</p>
                            </div>
                        )}

                        <button
                            onClick={handleReset}
                            className="bg-indigo-600 text-white w-full py-2 rounded mb-2 hover:bg-indigo-700"
                        >
                            Scan Next
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 mt-4 text-sm underline"
                >
                    Close Scanner
                </button>
            </div>
        </div>
    );
};

export default AdminScanner;
