import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../components/AuthProvider";

export default function NewExpense() {
    const navigate = useNavigate();
    const user = useContext(AuthContext);

    const [subject, setSubject] = useState('');
    const [merchant, setMerchant] = useState('');
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [employee, setEmployee] = useState('');
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [team, setTeam] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setInvoiceFile(e.target.files[0]);
    };

    const validateForm = () => {
        if (!subject || !merchant || !date || !amount || !category || !employee) {
            setErrorMessage("Please fill in all required fields.");
            return false;
        }
        if (isNaN(amount) || amount <= 0) {
            setErrorMessage("Amount must be a positive number.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const obj = {
            subject,
            merchant,
            date,
            amount,
            category,
            description,
            employee,
            team,
            uid: user.user.uid,
        };

        try {
            if (invoiceFile) {
                const fileRef = ref(storage, `invoice/${invoiceFile.name}`);
                await uploadBytes(fileRef, invoiceFile);
                const downloadUrl = await getDownloadURL(fileRef);
                obj.invoiceUrl = downloadUrl;
            }

            const response = await fetch('https://backend-2txi.vercel.app/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Expense saved successfully:', data);
                navigate('/expense');
            } else {
                setErrorMessage('Failed to save expense. Please try again.');
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            console.log("Loading..."); // Debugging message to confirm loading state
        }
    }, [loading]);

    return (
        <div className="container" style={{ display: "flex" }}>
            <div className="container">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="btn-close" onClick={() => navigate('/expense')}></button>
                </div>

                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <div style={{ display: "flex", flexDirection: "column" }}>
                    {[
                        { label: "Subject", value: subject, setter: setSubject },
                        { label: "Merchant", value: merchant, setter: setMerchant },
                        { label: "Date*", value: date, setter: setDate, type: "date" },
                        { label: "Total*", value: amount, setter: setAmount, type: "number" },
                        { label: "Category*", value: category, setter: setCategory, select: true, options: ["Select Type", "Trip", "Services", "Catering"] },
                        { label: "Description", value: description, setter: setDescription },
                        { label: "Employee Name*", value: employee, setter: setEmployee },
                        { label: "Team*", value: team, setter: setTeam, select: true, options: ["Select team", "Project management", "Software development", "Design team"] },
                    ].map(({ label, value, setter, type, select, options }, index) => (
                        <div className="mb-3 row" key={index}>
                            <label className="col-sm-2 col-form-label">{label}</label>
                            <div className="col-sm-10">
                                {select ? (
                                    <select
                                        className="form-select"
                                        onChange={(e) => setter(e.target.value)}
                                        disabled={loading} // Disable input during loading
                                    >
                                        {options.map((option, idx) => (
                                            <option key={idx} value={option === "Select Type" ? "" : option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={type || "text"}
                                        className="form-control"
                                        value={value}
                                        onChange={(e) => setter(e.target.value)}
                                        disabled={loading} // Disable input during loading
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <label
                        htmlFor="file-upload"
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                        style={{ width: "100%", height: "50px", marginTop: "10px", cursor: "pointer" }}
                    >
                        <i className="fas fa-upload me-2"></i> {/* Font Awesome upload icon */}
                        {invoiceFile ? invoiceFile.name : "Upload a receipt"}
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                    </label>
                </div>

                <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginTop: "10px" }}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        'Save'
                    )}
                </button>
            </div>
        </div>
    );
}
