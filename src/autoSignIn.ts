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
    console.log(event, newUrl, oldUrl)
    if (oldUrl != newUrl) {
      try {
        urlChanged(oldUrl, window.location)
      }
      finally {
        oldUrl = newUrl
      }
    }
  })

  document.addEventListener("DOMContentLoaded", () => {
     checkLocationAndSignInIfNeed()
   })

  class Credentials {
    constructor(public login: string, public password: string) {
    }
  }

  async function loadCredentials(): Promise<Credentials> {
    const data = await keytar.getPassword(SERVICE_NAME, LOGIN_NAME)
    console.log("data: " + data)
    if (isNotEmpty(data)) {
      try {
        const parsed = JSON.parse(data)
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
        console.error("cannot parse data: " + data, e)
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

  async function fillAndSubmit(formElement: HTMLFormElement) {
    const credentials = await loadCredentials()
    if (credentials != null && isNotEmpty(credentials.login)) {
      setValue(getInputElement("email"), credentials.login)

      if (isNotEmpty(credentials.password)) {
        setValue(getInputElement("password"), credentials.password);
        (<HTMLButtonElement>document.querySelector('div.os-form-btn-container > button[type="submit"')).click()
        return
      }
    }

    const superOnSubmit: any = formElement.onsubmit
    formElement.onsubmit = event => {
      passwordToSave = null
      if (superOnSubmit != null) {
        superOnSubmit(event)
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
        .catch(e => console.error(e))
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
      if (newLocation.host == "cad.onshape.com" && (oldUrl == null || oldUrl.endsWith("/signin")) && newLocation.pathname != "/signup/forgotpassword") {
        keytar.setPassword(SERVICE_NAME, LOGIN_NAME, JSON.stringify([passwordToSave.login, passwordToSave.password]))
          .catch((e: any) => console.error(e))
      }
      passwordToSave = null
    }
    else if (document.readyState != "loading") {
      checkLocationAndSignInIfNeed()
    }
  }
}())