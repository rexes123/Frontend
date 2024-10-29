import Nav from "../components/Nav";
import { useState, useContext, useEffect } from "react";
import Dashboard from "../pages/Dashboard";
import Expense from "../pages/Expense";
import { AuthContext } from "../components/AuthProvider";
import { Timestamp, doc, getDoc, setDoc, collection, orderBy, query, limit, getDocs } from "firebase/firestore";
import { db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingImage, setLoadingImage] = useState(true);

  // State variables for email, name, and phone
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const uid = user.uid;
          const userDoc = doc(db, 'users', uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            // Set the email, name, and phone states based on the fetched data
            setEmail(data.email || '');
            setName(data.name || '');
            setPhone(data.phone || '');
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No user is signed in');
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      if (selectedFile && user) {
        const imageRef = ref(storage, `post/${selectedFile.name}`);
        const uploadResult = await uploadBytes(imageRef, selectedFile);
        const newFileUrl = await getDownloadURL(uploadResult.ref);

        const postsRef = collection(db, `users/${user.uid}/posts`);
        const newPostRef = doc(postsRef);
        await setDoc(newPostRef, { fileUrl: newFileUrl, timestamp: Timestamp.now() });

        setFileUrl(newFileUrl);
      } else {
        console.log('No user is signed in');
      }
    } catch (e) {
      console.error('Error uploading file:', e);
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (fileUrl && user) {
      const imageName = decodeURIComponent(fileUrl.split('/').pop().split('?')[0]);
      const imageRef = ref(storage, `post/${imageName}`);

      try {
        await deleteObject(imageRef);
        const postsRef = collection(db, `users/${user.uid}/posts`);
        const q = query(postsRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapShot = await getDocs(q);

        if (!querySnapShot.empty) {
          const latestPostDoc = querySnapShot.docs[0];
          await setDoc(latestPostDoc.ref, { fileUrl: '', timestamp: Timestamp.now() }, { merge: true });
        }

        setFileUrl('');
        console.log("Profile picture removed successfully.");
      } catch (e) {
        console.error('Error removing profile picture:', e);
      }
    } else {
      console.log("No profile picture to remove or no user signed in.");
    }
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        setLoadingImage(true);
        try {
          const postRef = collection(db, `users/${user.uid}/posts`);
          const q = query(postRef, orderBy("timestamp", "desc"), limit(1));
          const querySnapShot = await getDocs(q);

          if (!querySnapShot.empty) {
            const latestPostDoc = querySnapShot.docs[0];
            const latestPostData = latestPostDoc.data();
            setFileUrl(latestPostData.fileUrl || '');
          }
        } catch (e) {
          console.error('Error fetching document:', e);
        } finally {
          setLoadingImage(false);
        }
      }
    };
    fetchProfileImage();
  }, [user]);

  const handleProfileUpdate = async () => {
    if (user) {
      try {
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, { email, name, phone }, { merge: true });
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      console.log("No user is signed in");
    }
  };

  return (
    <div className="d-flex align-items-start" style={{ width: "100%"}}>
      <div className="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical" style={{ width: "100%"}}>
        <div className="profilePic" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        {loadingImage ? (
          <div>
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <img
            src={fileUrl || 'https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png'}
            alt="Profile"
            style={{ width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer' }}
            onClick={() => fileUrl && window.open(fileUrl, '_blank')}
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id="fileInput"
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" className="btn btn-secondary" style={{ cursor: 'pointer', marginTop: '10px' }}>
          Upload Profile Picture
        </label>
        </div>

        {userData && (
          <div style={{ marginTop: "20px" }}>
            <form>
              <div style={{display: "flex", justifyContent: "space-between"}}>
            <div className="mb-3" style={{ width: "48%"}}>
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              </div>
      
              <div className="mb-3" style={{ width: "48%"}}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={handleProfileUpdate} style={{ width: "25%"}}>
          Update Profile
        </button>
      </div>
    </div>
  );
}
