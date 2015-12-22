declare class Notification {
  constructor(title: string, options: any)
}

(function (): void {
  "use strict"

  const SERVICE_NAME = "org.develar.onshape"
  const LOCAL_STORAGE_LOGIN_KEY = SERVICE_NAME.replace('.', '_') + ".login"

  let passwordToSave: Credentials = null
  let maybeUrlChangedTimerId: any = null
  let foundFormElementTimerId: number = -1
  let oldUrl: string = null

  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.on("maybeUrlChanged", () => {
    maybeUrlChanged(true)
  })

  ipcRenderer.on("notify", (event:any, title: string, message: string) => {
    new Notification(title, {
      body: message
    })
  })

  document.addEventListener("DOMContentLoaded", () => {
     checkLocationAndSignInIfNeed()
   })

  class Credentials {
    constructor(public login: string, public password: string) {
    }
  }

  function getInputElement(name: string) {
    return <HTMLInputElement>document.querySelector('input[name="' + name + '"]');
  }

  function isNotEmpty(string: string) {
    // yep, get used to strict Java&Kotlin and cannot see code like (foo)
    return string != null && string.length != 0
  }

  function setValue(input: HTMLInputElement, value: string) {
    input.value = value
    // we must trigger "change" event otherwise form is not submitted on click emulate (it seems, because angular (used in Onshape) doesn't detect changes immediately)
    input.dispatchEvent(new Event("change", {"bubbles": true}))
  }

  function fillAndSubmit(formElement: HTMLFormElement) {
    let login: string = localStorage.getItem(LOCAL_STORAGE_LOGIN_KEY)
    if (isNotEmpty(login)) {
      setValue(getInputElement("email"), login)

      let password = require("keytar").getPassword(SERVICE_NAME, login)
      if (isNotEmpty(password)) {
        setValue(getInputElement("password"), password);
        (<HTMLButtonElement>document.querySelector('div.os-form-btn-container > button[type="submit"')).click()
        return
      }
    }

    var superOnSubmit: any = formElement.onsubmit
    formElement.onsubmit = () => {
      passwordToSave = null
      if (superOnSubmit != null) {
        superOnSubmit()
      }

      let login = getInputElement("email").value
      let password = getInputElement("password").value
      if (isNotEmpty(login) && isNotEmpty(password)) {
        passwordToSave = new Credentials(login, password)
      }
    }
  }

  function fillOrWait() {
    let formElement = <HTMLFormElement>document.querySelector("form[name='osForm']")
    if (formElement != null) {
      console.log("form element found")
      fillAndSubmit(formElement)
    }
    else {
      console.log("form element not found, schedule")
      setTimeout(() => {
        checkLocationAndSignInIfNeed()
      })
    }
  }

  function checkLocationAndSignInIfNeed() {
    let location = window.location
    if (location.host == "cad.onshape.com" && location.pathname == "/signin") {
      fillOrWait()
    }
  }

  function maybeUrlChanged(checkLater: boolean) {
    if (maybeUrlChangedTimerId != null) {
      clearTimeout(maybeUrlChangedTimerId)
      maybeUrlChangedTimerId = null
    }

    let newLocation = window.location
    let newUrl = newLocation.href
    if (oldUrl != newUrl) {
      try {
        console.log("url changed:", oldUrl, newUrl)
        urlChanged(oldUrl, newLocation)
      }
      finally {
        oldUrl = newUrl
      }
    }
    else if (checkLater) {
      // let's reschedule
      maybeUrlChangedTimerId = setTimeout(() => { maybeUrlChanged(false) }, 100)
    }
  }

  function urlChanged(oldUrl: string, newLocation: Location) {
    if (foundFormElementTimerId != -1) {
      clearTimeout(foundFormElementTimerId)
    }

    if (passwordToSave != null) {
      if (newLocation.host == "cad.onshape.com")
        if (oldUrl.endsWith("/signin") && newLocation.pathname != "/signup/forgotpassword") {
          localStorage.setItem(LOCAL_STORAGE_LOGIN_KEY, passwordToSave.login)
          require("keytar").replacePassword(SERVICE_NAME, passwordToSave.login, passwordToSave.password)
        }
      passwordToSave = null
    }
    else if (document.readyState != "loading") {
      checkLocationAndSignInIfNeed()
    }
  }
}())