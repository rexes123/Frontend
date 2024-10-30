import { useState, useContext, useEffect, useRef } from "react"
import Dashboard from "../pages/Dashboard"
import Expense from "../pages/Expense"
import { NavLink } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import { Timestamp, doc, getDoc, setDoc, collection, orderBy, query, limit, getDocs } from "firebase/firestore";
import { db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth } from "../firebase";



export default function Nav() {

  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [loadingImage, setLoadingImage] = useState(true);


  useEffect(() => {
    const offCanvasElement = offCanvasRef.current;
    if (offCanvasElement) {
      bootstrap.Offcanvas.getOrCreateInstance(offCanvasElement);
    }
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const uid = user.uid;
          const userDoc = doc(db, 'users', uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); //Set loading to false if no user is signed in
      }
    };
    fetchUserData()
  }, [user])

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      if (selectedFile && user) {
        //Create a reference to the storage location
        const imageRef = ref(storage, `post/${selectedFile.name}`);

        //Upload the file
        const uploadResult = await uploadBytes(imageRef, selectedFile);

        //Get the file URL
        const newFileUrl = await getDownloadURL(uploadResult.ref);

        // Create a reference to the user's posts subcollection
        const postsRef = collection(db, `users/${user.uid}/posts`);
        const newPostRef = doc(postsRef);

        //Add the file URL to the new document
        await setDoc(newPostRef, { fileUrl: newFileUrl, timestamp: Timestamp.now() });

        //Update the local state to reflect the image URL
        setFileUrl(newFileUrl);

        //Create a reference to the user's posts subcollection
        // const postsRef = collection(db, `users/${user.uid}/posts`);
        // const newPostsRef = doc(postsRef);
      } else {
        console.log('No user is signed in');
      }
    } catch (e) {
      console.error('Error uploading file:', e);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        // Start loading when fetching
        setLoadingImage(true);
        try {
          //Reference to user's posts subcollection
          const postRef = collection(db, `users/${user.uid}/posts`);

          //Query to get latest post
          const q = query(postRef, orderBy("timestamp", "desc"), limit(1));
          const querySnapShot = await getDocs(q);

          if (!querySnapShot.empty) {
            const latestPostDoc = querySnapShot.docs[0];
            const latestPostData = latestPostDoc.data();
            setFileUrl(latestPostData.fileUrl || '');
          }
        } catch (e) {
          console.error('Error fetching document:', e)
        } finally {
          setLoadingImage(false);
        }
      };
    }

    fetchProfileImage()
  }, [user])


  const [activeTab, setActiveTab] = useState('');

  const renderContent = () => {
    if (activeTab === 'home') {
      return <Dashboard />
    } else if (activeTab === 'expenses') {
      return <Expense />
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      setUserData(null);
      navigate('/login')
    } catch (error) {
      console.error(error.message);
    }
  }

  const offCanvasRef = useRef(null);

  const closeOffCanvas = () => {
    const offCanvas = bootstrap.Offcanvas.getInstance(offCanvasRef.current);
    if (offCanvas) {
      offCanvas.hide();
    }
  };


  return (
    <div class="d-flex align-items-start" style={{position: "fixed"}} id="navBar">

      <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        {loadingImage ? (
          <div>
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <img
            src={fileUrl || 'https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png'} // Use a default image if no profile picture is uploaded
            alt="Profile"
            style={{ width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer' }}
            onClick={() => fileUrl && window.open(fileUrl, '_blank')}
          />
        )}




        {userData ? (
          <div style={{ marginTop: "20px" }}>
            <form>
              <div class="mb-3">
                <input type="email" class="form-control" id="exampleInputEmail1" placeholder={userData.name} disabled />
              </div>
            </form>
          </div>
        ) : (
          <p>No user data available</p>
        )}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
          <NavLink  to="/" role="tab" className="form-control"><i class="bi bi-house navBar__icon "></i><span style={{marginLeft: "10px"}}>Home</span></NavLink>
          <NavLink to="/expense" className="form-control" role="tab">
            <i className="bi bi-cart-plus navBar__icon" /><span style={{marginLeft: "10px"}}>Expenses</span>
          </NavLink>
          <NavLink to="/trips" className="form-control" role="tab"><i class="bi bi-airplane navBar__icon" /><span style={{marginLeft: "10px"}}>Trip</span></NavLink>
          <NavLink to="/approvals" className="form-control" role="tab"><i class="bi bi-clipboard-check navBar__icon" /><span style={{marginLeft: "10px"}}>Approvals</span></NavLink>
          <NavLink to="/settings" className="form-control" role="tab" class="nav-link"><i class="bi bi-gear navBar__icon"></i><span style={{marginLeft: "10px"}}>Settings</span></NavLink>
        </div>
        <a onClick={handleLogout} class="logout" style={{position:"absolute", bottom:"-50%", textDecoration: 'none', backgroundColor: "transparent" }}>
          <i class="bi bi-door-closed navBar__icon"></i>Log out
        </a>
      </div>
      <div class="tab-content" id="v-pills-tabContent">
        {renderContent()}
      </div>
    </div>
  )
}