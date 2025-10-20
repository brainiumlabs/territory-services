$(document).ready(function () {
  $(
    "img.imagedropshadow, img.imagequarter, img.imagethird, img.imagehalf, img.imagefull"
  ).each(function () {
    dataToLightboxGallery(this);
  });

  function addValidInvalidClasses(fieldInput) {
    var value = fieldInput.val().trim();

    if (value === "") {
      fieldInput.removeClass("is-valid");
      fieldInput.prop("required") && fieldInput.addClass("is-invalid");
    } else {
      // Remove any existing validation classes
      fieldInput.removeClass("is-valid is-invalid");

      // Check the validity
      if (fieldInput[0].checkValidity()) {
        fieldInput.addClass("is-valid");
      } else {
        fieldInput.addClass("is-invalid");
      }
    }
  }

  $("input, textarea, select").blur(function () {
    addValidInvalidClasses($(this));
  });

  function dataToLightboxGallery(el) {
    var altthis = $(el).attr("alt");
    var srcthis = $(el).attr("src");
    $(el).parent("a").attr({
      href: srcthis,
      "data-lightbox": "galery",
      "data-title": altthis,
    });
  }

  // Alert banner handle function
  function handleAlertBanner() {
    //Sitebanner close button on click function
    $(".ntg-sidewide-alert .close").on("click", function () {
      sessionStorage.setItem("site-alert-dismissed", true);
    });

    //Retrive session variable, check user's choice
    var isSiteAlertDismissed = sessionStorage.getItem("site-alert-dismissed");

    if (isSiteAlertDismissed == "true") {
      //Keep the alert dismissed
      $(".ntg-sidewide-alert").addClass("d-none");
    } //Show the alert
    else {
      $(".ntg-sidewide-alert").addClass("d-block");
    }
  }

  // Force external links to open in new window
  function externalLinksInNewWindow() {
    $("a")
      .not('[href*="mailto:"]')
      .each(function () {
        var isInternalLink = new RegExp("/" + window.location.host + "/");
        if (!isInternalLink.test(this.href)) {
          //$(this).attr("target", "_blank");
          $(this).addClass("external");
        }
      });
    $("a.external").has("img").removeClass("external");
    $("a[href*='javascript']").removeClass("external");

    // remove external class from telephone number links
    $('a[href*="tel:"]').each(function () {
      $(this).removeClass("external");
    });
  }

  // Add Auth0 login/logout functionality
  auth0
    .createAuth0Client({
      domain: "dev.ntg-dcdd.auth0app.com",
      clientId: "rWBUjZnqbBIIrjen52u3Q3Lz6XGVsACL",
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    })
    .then(async (auth0Client) => {
      // Assumes a button with id "login" in the DOM
      const loginButton = document.getElementById("login");

      loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        auth0Client.loginWithRedirect();
      });

      if (
        location.search.includes("state=") &&
        (location.search.includes("code=") ||
          location.search.includes("error="))
      ) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
      }

      // Assumes a button with id "logout" in the DOM
      const logoutButton = document.getElementById("logout");

      logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        auth0Client.logout();
      });

      const isAuthenticated = await auth0Client.isAuthenticated();
      const userProfile = await auth0Client.getUser();

      // Assumes an element with id "profile" in the DOM
      const profileElement = document.getElementById("profile");

      if (isAuthenticated) {
        profileElement.style.display = "block";
        profileElement.innerHTML = `
          <p>${userProfile.name}</p>
          <img src="${userProfile.picture}" />
        `;
      } else {
        profileElement.style.display = "none";
      }
    });

  handleAlertBanner(); //call handleAlretBanner function
  externalLinksInNewWindow(); //call externalLinksInNewWindow function
});
