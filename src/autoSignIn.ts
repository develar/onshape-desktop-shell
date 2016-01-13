declare class Notification {
  constructor(title: string, options: any)
}

(function (): void {
  "use strict"

  const SERVICE_NAME = "org.develar.onshape"
  const LOGIN_NAME = "data"

  const keytar = require("keytar")

  let passwordToSave: Credentials = null
  let foundFormElementTimerId: number = -1
  let oldUrl: string = null

  const ipcRenderer = require("electron").ipcRenderer
  ipcRenderer.on("maybeUrlChanged", (event: any, newUrl: string) => {
    if (oldUrl != newUrl) {
      try {
        urlChanged(oldUrl, window.location)
      }
      finally {
        oldUrl = newUrl
      }
    }
  })

  ipcRenderer.on("notify", (event: any, title: string, message: string) => {
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

  function loadCredentials(): Credentials {
    const data = keytar.getPassword(SERVICE_NAME, LOGIN_NAME)
    if (isNotEmpty(data)) {
      try {
        var parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          if (parsed.length == 2) {
            return new Credentials(parsed[0], parsed[1])
          }
          else {
            // don't sent "parsed" due to security reasons
            ipcRenderer.send("log.error", "Incorrect credentials data, see keychain")
          }
        }
      }
      catch (e) {
        console.error(e)
        ipcRenderer.send("log.error", e)
      }
    }
    return null
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
    const credentials = loadCredentials()
    if (credentials != null && isNotEmpty(credentials.login)) {
      setValue(getInputElement("email"), credentials.login)

      if (isNotEmpty(credentials.password)) {
        setValue(getInputElement("password"), credentials.password);
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

  function urlChanged(oldUrl: string, newLocation: Location) {
    if (foundFormElementTimerId != -1) {
      clearTimeout(foundFormElementTimerId)
    }

    if (passwordToSave != null) {
      if (newLocation.host == "cad.onshape.com" && oldUrl.endsWith("/signin") && newLocation.pathname != "/signup/forgotpassword") {
        keytar.replacePassword(SERVICE_NAME, LOGIN_NAME, JSON.stringify([passwordToSave.login, passwordToSave.password]))
      }
      passwordToSave = null
    }
    else if (document.readyState != "loading") {
      checkLocationAndSignInIfNeed()
    }
  }
}())