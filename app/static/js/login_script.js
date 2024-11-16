// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDV9FCj2T3icEA-_iqY6cFV9K1Xzyg2BbQ",
    authDomain: "auth-login-f60fe.firebaseapp.com",
    projectId: "auth-login-f60fe",
    storageBucket: "auth-login-f60fe.firebasestorage.app",
    messagingSenderId: "366471157245",
    appId: "1:366471157245:web:d81f538667dc78ac3fb594",
    measurementId: "G-2FE7RTW0X6"
};
firebase.initializeApp(firebaseConfig);

// Fungsi untuk Login dengan Google
function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            return result.user.getIdToken();
        })
        .then(idToken => {
            // Kirim ID token ke server Flask
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `idToken=${idToken}`
            }).then(() => {
                window.location.href = "/index";
            });
        }).catch(error => {
            console.error("Error during Google sign-in:", error);
        });
}
