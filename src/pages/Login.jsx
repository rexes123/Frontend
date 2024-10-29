import { useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import SignUp from './SignUp';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    console.log(email);
    console.log(password);

    const user = localStorage.getItem('user');
    const auth = getAuth();

    const navigate = useNavigate();

    useEffect(() => {
        // Listener for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/');
            }
        });

        // Clean up the subscription on component unmount
        return () => unsubscribe();
    }, [auth, navigate]);

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    const handlePassword = (e) => {
        setPassword(e.target.value);
    }


    const handleLogin = async (e) => {
        console.log('Login')
        e.preventDefault();

        try {
            const response = await signInWithEmailAndPassword(auth, email, password)
            const user = response.user;
            console.log(user);

            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email
            }));

        } catch (error) {
            console.log(error.message);
        }
    }

    const navSignUp = () =>{
        console.log('Sign Up')
        navigate('/signup')
    }


    return (
        <div className='container'>
            <h3>Login</h3>
            <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" onChange={handleEmail} value={email} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" onChange={handlePassword} value={password} />
                </Form.Group>
            </Form>

            <button onClick={handleLogin} class="btn btn-primary" style={{marginRight: "10px"}}>Login</button>
            <button class="btn btn-secondary" onClick={navSignUp}>Sign up</button>
        </div>
    )
}