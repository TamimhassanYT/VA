let isNewUser = true;

async function loadac() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (data.loggedIn) {
            document.getElementById('username').innerText = data.username;
            document.getElementById('user-avatar').src = data.avatar;
            document.getElementById('uid').innerText = data.id;
            document.getElementById('sbtn').innerText = 'Account';
            document.getElementById('ah').style.display = 'flex';
            document.getElementById('afb').style.display = 'flex';
            document.getElementById('sh').style.display = 'none';
            document.getElementById('su').style.display = 'none';
            document.getElementById('lu').style.display = 'flex';
            document.getElementById('sbtn').addEventListener("click", function accbb() {
                document.getElementById('ac').style.display = 'grid';
            });
        } else {
            document.getElementById('lu').style.display = 'none';
            document.getElementById('sbtn').innerText = 'Signup';
            document.getElementById('ah').style.display = 'none';
            document.getElementById('afb').style.display = 'none';
            document.getElementById('sbtn').addEventListener("click", function signbb() {
                document.getElementById('signbb').style.display = 'flex';
            });
        }
    } catch (err) {
        console.error("Auth check failed", err);
    }
}

// THE FIXED HASPASS LOGIC
async function loadui() {
    try {
        const response = await fetch('/api/auth/setup-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "check" }) 
        });
        const data = await response.json();
        
        const nap = document.getElementById('nap');
        const loginInput = document.getElementById('logininput');
        const alu = document.getElementById('alu');
        const poperrp = document.getElementById('poperrp');
        const poperrh3 = document.getElementById('poperrh3');
        const errnupfbb = document.getElementById('err-nupf-bb');
        const signb = document.getElementById('signb')

        // --- STEP 1: ALWAYS handle the registration UI first ---
        if (data.haspass) {
            isNewUser = false;
            // User has a password, so hide the "Repeat Password" box (#nap)
            if (nap) nap.style.display = 'none';
            if (loginInput) loginInput.placeholder = "Enter Password to Login...";
            alu.style.display = 'block';
            if (poperrh3.innerText === '! Setup password') {
                window.location.hash = '';
            }
        } else {
            isNewUser = true;
            // New user, make sure they see the registration box
            if (nap) nap.style.display = 'block';
            if (data.ErrPass === "usersetuppass") {
                window.location.hash = '#err-nupf-bb';
                alu.style.display = 'none';
                poperrh3.innerText = '! Setup password';
                poperrp.innerText = 'Please setup password in account to prevent to be hacked';
                errnupfbb.style.backgroundColor = 'rgb(167, 0, 0, 0.274)';
                errnupfbb.style.border = '4px solid rgb(151, 0, 0)';
            }
        }
        // --- STEP 2: Handle the auto-redirect ONLY after UI is set ---
        if (data.authorized) {
            // If they are trying to open the sign-in modal but are already logged in
            if (window.location.hash === '#signin') {
               window.location.hash = '#success';
            }

//            if (window.location.href == '#success') {
  //              let va = `<span style="font-family: 'Outfit', sans-serif;font-weight: bold">VoxelAdder</span>`
    //            window.location.hash = '#err-nupf-bb';
      //          poperrh3.innerHTML = 'Wellcome to ' + va;
        //        poperrp.innerText = 'Now u can save you changes in editor and you exited guest mode';
          //      errnupfbb.style.backgroundColor = 'rgb(167, 0, 0, 0.274)';
          //      errnupfbb.style.border = '4px solid rgb(151, 0, 0)';
          //  }
            // Even if not redirecting, we stop here because they are verified
            return;
        }

        if (data.ErrPass === "userlogin") {
            let login = ` <span onclick="window.location.hash = '#signin'" style="font-family: 'Outfit', sans-serif;cursor:pointer;color:lightblue">Login</span>`;
            errnupfbb.style.border = '4px solid rgb(0, 151, 0)';
            errnupfbb.style.backgroundColor = 'rgba(0, 151, 0, 0.274)';
            poperrh3.innerText = 'Login';
            poperrp.innerHTML = "Please" + login + " to complete authentication";
            window.location.hash = '#err-nupf-bb';
        }
    } catch (e) {
        console.error("Load UI failed", e);
    }
}



// SEPARATE FUNCTION: For New Users (Registration)
async function register() {
    const p1 = document.getElementById('pass').value;
    const p2 = document.getElementById('repass').value;
    const err = document.getElementById('error-register');

    if (!p1 || p1.length < 6) {
        err.innerText = "Password must be at least 6 characters.";
        err.style.color = "red";
        return;
    }
    if (p1 !== p2) {
        err.innerText = "Passwords do not match!";
        err.style.color = "red";
        return;
    }

    await granted("register", p1, "error-register");
}

// SEPARATE FUNCTION: For Logout Users (Login)
async function login() {
    const p = document.getElementById('logininput').value;
    const err = document.getElementById('error-login');

    if (!p) {
        err.innerText = "Please enter your password.";
        err.style.color = "red";
        return;
    }

    await granted("login", p, "error-login");
}

// REUSABLE API GATE
async function granted(targetAction, userPassword, errorElementId) {
    const err = document.getElementById(errorElementId);
    try {
        const response = await fetch('/api/auth/setup-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: targetAction, 
                password: userPassword 
            })
        });

        const data = await response.json();
        
        if (data.access === "authorized") {
            window.location.href = "/dashboard";
        } else {
            err.innerText = data.error || "Access Denied";
            err.style.color = "red";
        }
    } catch (e) {
        err.innerText = "Network error.";
    }
}

// Start everything
loadac();
loadui();