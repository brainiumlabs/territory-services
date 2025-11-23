document.addEventListener("DOMContentLoaded", function () {
  auth0
    .createAuth0Client({
      domain: "identity-dev.nt.gov.au",
      clientId: "rWBUjZnqbBIIrjen52u3Q3Lz6XGVsACL",
      authorizationParams: {
        redirect_uri: window.location.origin + "/service/callback",
      },
      cacheLocation: "localstorage",
      useRefreshTokens: true,
    })
    .then(async (auth0Client) => {
      // Handle logout redirect.
      const postLogoutReturnTo = sessionStorage.getItem("postLogoutReturnTo");

      if (postLogoutReturnTo) {
        sessionStorage.removeItem("postLogoutReturnTo");
        window.location.href = postLogoutReturnTo;
        return;
      }

      // UI elements.
      const loginDesktop = document.getElementById("login-desktop");
      const accountDropdown = document.querySelector(".dropdown.account");
      const accountDesktop = document.getElementById("account-desktop");
      const logoutDesktop = document.getElementById("logout-desktop");

      const loginMobile = document.getElementById("login-mobile");
      const accountMobile = document.getElementById("account-mobile");
      const logoutMobile = document.getElementById("logout-mobile");

      const loginInternal = document.getElementById("internal-login");
      const registerInternal = document.getElementById("internal-register");

      const loginGateway = document.getElementById("gateway-login");
      const registerGateway = document.getElementById("gateway-register");
      const guestGateway = document.getElementById("gateway-guest");

      let inactivityTimer;

      // Handle desktop login button.
      if (loginDesktop) {
        loginDesktop.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.setItem("postLoginReturnTo", window.location.href); // Store the page the user clicked the login button from.
          window.location.href = loginDesktop.getAttribute("href"); // Send the user to the internal login page.
        });
      }

      // Handle mobile login button.
      if (loginMobile) {
        loginMobile.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.setItem("postLoginReturnTo", window.location.href); // Store the page the user clicked the login button from.
          window.location.href = loginMobile.getAttribute("href"); // Send the user to the internal login page.
        });
      }

      // Handle internal login button.
      if (loginInternal) {
        loginInternal.addEventListener("click", (e) => {
          e.preventDefault();
          const returnTo =
            sessionStorage.getItem("postLoginReturnTo") || window.location.href; // Send the user to the link stored in postLoginReturnTo, fallback to current page.
          auth0Client.loginWithRedirect({
            appState: { returnTo },
          });
        });
      }

      // Handle internal register button.
      if (registerInternal) {
        registerInternal.addEventListener("click", (e) => {
          e.preventDefault();
          const returnTo =
            sessionStorage.getItem("postLoginReturnTo") || window.location.href; // Send the user to the link stored in postLoginReturnTo, fallback to current page.
          auth0Client.loginWithRedirect({
            appState: { returnTo },
            screen_hint: "signup",
            authorizationParams: {
              screen_hint: "signup",
            },
          });
        });
      }

      // Handle gateway login button.
      if (loginGateway) {
        loginGateway.addEventListener("click", (e) => {
          e.preventDefault();
          const returnTo =
            sessionStorage.getItem("postLoginReturnTo") || window.location.href; // Send the user to the link stored in postLoginReturnTo, fallback to current page.
          auth0Client.loginWithRedirect({
            appState: { returnTo },
          });
        });
      }

      // Handle gateway register button.
      if (registerGateway) {
        registerGateway.addEventListener("click", (e) => {
          e.preventDefault();
          const returnTo =
            sessionStorage.getItem("postLoginReturnTo") || window.location.href; // Send the user to the link stored in postLoginReturnTo, fallback to current page.
          auth0Client.loginWithRedirect({
            appState: { returnTo },
            screen_hint: "signup",
            authorizationParams: {
              screen_hint: "signup",
            },
          });
        });
      }

      // Handle gateway guest button.
      if (guestGateway) {
        guestGateway.addEventListener("click", (e) => {
          e.preventDefault();
          const returnTo =
            sessionStorage.getItem("postLoginReturnTo") || window.location.href; // Send the user to the link stored in postLoginReturnTo, fallback to current page.
          window.location.href = returnTo; // Skip Auth0, go straight to the link stored in postLoginReturnTo.
        });
      }

      // Handle login and register buttons added via content.
      document.body.addEventListener("click", (e) => {
        // Login button.
        if (e.target.matches(".btn-login")) {
          e.preventDefault();
          const href = e.target.getAttribute("href");
          const returnTo =
            href && href !== "#" && href !== "" ? href : window.location.href; // Send the user to the href link set if it exists after authenticating, fallback to current page.
          sessionStorage.setItem("postLoginReturnTo", returnTo);
          window.location.href = "/service/login"; // Send the user to the gateway login page.
        }

        // Register button.
        if (e.target.matches(".btn-register")) {
          e.preventDefault();
          const href = e.target.getAttribute("href");
          const returnTo =
            href && href !== "#" && href !== "" ? href : window.location.href; // Send the user to the href link set if it exists after authenticating, fallback to current page.
          sessionStorage.setItem("postLoginReturnTo", returnTo);
          window.location.href = "/service/login"; // Send the user to the gateway login page.
        }
      });

      // Handle redirect callback.
      if (
        location.search.includes("code=") ||
        location.search.includes("error=")
      ) {
        const { appState } = await auth0Client.handleRedirectCallback();
        window.location.replace(
          (appState && appState.returnTo) || window.location.origin + "/service"
        ); // Send the user to the previous page they were on or fallback to home.
        return;
      }

      // Show timeout modal after redirecting from inactivity logout.
      if (sessionStorage.getItem("showTimeoutModal") === "true") {
        sessionStorage.removeItem("showTimeoutModal");
        const modal = new bootstrap.Modal(
          document.getElementById("sessionTimeoutModal")
        );
        modal.show();
      }

      // Handle logout.
      const logoutHandler = (e) => {
        e.preventDefault();
        clearInactivityTimer(); // Reset the inactivity timer.
        sessionStorage.setItem("postLogoutReturnTo", window.location.href); // Store the page the user clicked the logout button from.
        localStorage.setItem("showLogoutAlert", "true"); // Show the logout alert after logging out.
        auth0Client.logout({
          logoutParams: { returnTo: window.location.origin + "/service" },
        });
      };

      if (logoutDesktop) logoutDesktop.addEventListener("click", logoutHandler);
      if (logoutMobile) logoutMobile.addEventListener("click", logoutHandler);

      // Show an alert when the user is logged out.
      const logoutAlert = document.getElementById("logoutAlert");

      if (localStorage.getItem("showLogoutAlert") === "true") {
        logoutAlert.style.display = "block";
        setTimeout(() => {
          logoutAlert.style.display = "none";
          localStorage.removeItem("showLogoutAlert");
        }, 6000); // 6 seconds
      }

      // Trigger actions if the user is authenticated or not.
      const isAuthenticated = await auth0Client.isAuthenticated();

      if (isAuthenticated) {
        // Show or hide header login and account elements.
        if (loginDesktop) loginDesktop.style.display = "none";
        if (accountDropdown) accountDropdown.style.display = "block";

        if (accountMobile) accountMobile.style.display = "block";
        if (logoutMobile) logoutMobile.style.display = "block";
        if (loginMobile) loginMobile.style.display = "none";

        startInactivityTimer(auth0Client);

        console.log("Authenticated");
      } else {
        // Show or hide header login and account elements.
        if (loginDesktop) loginDesktop.style.display = "block";
        if (accountDropdown) accountDropdown.style.display = "none";

        if (loginMobile) loginMobile.style.display = "block";
        if (accountMobile) accountMobile.style.display = "none";
        if (logoutMobile) logoutMobile.style.display = "none";

        console.log("Anonymous");
      }

      // Log the user out after 30 minutes of inactivity.
      const modalLoginButton = document.getElementById("modalLoginButton");

      if (modalLoginButton) {
        modalLoginButton.addEventListener("click", async () => {
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("sessionTimeoutModal")
          );
          modal.hide();
          await auth0Client.loginWithRedirect();
        });
      }

      function startInactivityTimer(client) {
        resetInactivityTimer();
        ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(
          (event) => {
            document.addEventListener(event, resetInactivityTimer);
          }
        );

        function resetInactivityTimer() {
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            sessionStorage.setItem("postLogoutReturnTo", window.location.href);
            sessionStorage.setItem("showTimeoutModal", "true");
            localStorage.setItem("showLogoutAlert", "true");
            client.logout({
              logoutParams: { returnTo: window.location.origin + "/service" },
            });
          }, 30 * 60 * 1000); // 30 minutes
        }
      }

      function clearInactivityTimer() {
        clearTimeout(inactivityTimer);
      }
    });
});
