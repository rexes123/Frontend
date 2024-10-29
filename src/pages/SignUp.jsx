import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleName = (e) => {
        setName(e.target.value);
    };

    const handleEmail = (e) => {
        setEmail(e.target.value);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            // Create a new user
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const uid = response.user.uid;
            console.log(`User created with UID: ${uid}`);

            // Save user data to Firestore
            await setDoc(doc(db, 'users', uid), {
                name: name,
                email: email,
            });

            alert('Sign up successful!'); // Alert for successful sign-up
            navigate('/login'); // Redirect to login page after sign-up

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                alert('An account with this email already exists.'); // Alert for existing account
            } else {
                console.error(error.message);
                alert('An error occurred during sign up. Please try again.'); // Generic error alert
            }
        }
    };

    const navToLogin = () => {
        navigate('/login');
    };

    return (
        <div className='container'>
            <h3>Sign Up</h3>
            <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" onChange={handleName} value={name} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" onChange={handleEmail} value={email} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" onChange={handlePassword} value={password} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" onChange={handleConfirmPassword} value={confirmPassword} />
                </Form.Group>
            </Form>
            <button onClick={handleAdd} className="btn btn-primary" style={{ marginRight: "10px" }}>Sign Up</button>
            <button onClick={navToLogin} className="btn btn-secondary">Log in</button>
        </div>
    );
}
