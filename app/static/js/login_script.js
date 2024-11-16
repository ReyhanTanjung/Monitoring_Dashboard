/**
 *  Request configuration
 */
fetch('/config')
    .then(response => response.json())
    .then(firebaseConfig => {
        firebase.initializeApp(firebaseConfig);
    })
    .catch(error => {
        console.error("Error fetching Firebase configuration:", error);
    });


/**
 *  Google Login Function
 */
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
