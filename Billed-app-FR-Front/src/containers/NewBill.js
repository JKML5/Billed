import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })

    let user;
    user = JSON.parse(localStorage.getItem('user'))
    if (typeof user === 'string') {
      user = JSON.parse(user)
    }
    this.user = user
  }

  handleChangeFile = e => {
    e.preventDefault()
    const file =  e.target.files[0]
    const fileName = e.target.files[0].name

    const errorMessage = this.document.querySelector(`[data-testid="file-error-message"]`)

    try {
      if (this.validFileName(fileName)) {
        errorMessage.innerText = ''
      } else {
        throw "Extension de fichier incorrect";
      }
    } catch (error) {
      errorMessage.innerText = error
      return false;
    }

    const formData = new FormData()
    const email = this.user.email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      })
      .catch(error => console.error(error))
  }

  validFileName = fileName => {
    const fileExt = fileName.split('.').pop();

    return (['jpg', 'jpeg', 'png'].includes(fileExt))
  }

  handleSubmit = e => {
    e.preventDefault()

    const bill = {
      email: this.user.email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }

    if(this.fileName != null) {
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}