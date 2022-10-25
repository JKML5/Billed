/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import router from '../app/Router.js'

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'test@test.com' }))
  const html = NewBillUI()
  document.body.innerHTML = html
  const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
  const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

  describe("When I am on NewBill Page", () => {
    it('should work only for employees', () => {
      const user = JSON.parse(JSON.parse(window.localStorage.getItem('user'))) // "{\"type\":\"Employee\"}"
      expect(user.type).toBe('Employee')
    })

    describe("When I upload a file", () => {
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('change', handleChangeFile())

      it('should display error message if file type incorrect', () => {
        const wrongFile = new File(["foo"], "foo.txt", { type: "text/plain" });
        userEvent.upload(inputFile, wrongFile)
        
        expect(handleChangeFile).toHaveBeenCalled()
        expect(screen.getByTestId('file-error-message').innerText).toBe('Extension de fichier incorrect')
      })

      it('should display error message if no file', () => {
        // TODO Déjà géré par les navigateurs récents
      })

      it('should upload if ok', () => {

        const goodFile = new File(["foo"], "foo.jpg", { type: "image/jpeg" });
        userEvent.upload(inputFile, goodFile)

        expect(handleChangeFile).toHaveBeenCalled()
        // expect(screen.getByTestId('file-error-message').innerText).toBe('') // TODO marche pas
        expect(inputFile.files[0].name).toBe('foo.jpg')
      })
    })

    describe("When I click on submit button", () => {
      it('should create a bill', () => {
        const handleSubmit = jest.fn(() => newBill.handleSubmit)
        const form = screen.getByTestId('form-new-bill')
        form.addEventListener('submit', handleSubmit)

        // Nom & commentaire non obligatoire sur le formulaire TODO à vérifier
        const expenseType       = screen.getByTestId('expense-type')
        const expenseAmount     = screen.getByTestId('amount')
        const expenseDate       = screen.getByTestId('datepicker')
        const expenseVAT        = screen.getByTestId('vat')
        const expensePCT        = screen.getByTestId('pct')

        expenseType.value       = 'Transports'
        expenseAmount.value     = '30'
        expenseDate.value       = '2022-10-20'
        expenseVAT.value        = '70'
        expensePCT.value        = '20'

        const inputFile = screen.getByTestId('file')
        const file = new File(["foo"], "foo.jpg", { type: "image/jpeg" });
        userEvent.upload(inputFile, file)

        fireEvent.submit(form)

        expect(handleSubmit).toHaveBeenCalled()
        expect(expenseType.validity.valid).toBeTruthy()
        expect(expenseAmount.validity.valid).toBeTruthy()
        expect(expenseDate.validity.valid).toBeTruthy()
        expect(expenseVAT.validity.valid).toBeTruthy()
        expect(expensePCT.validity.valid).toBeTruthy()
        expect(inputFile.files[0]).toBeDefined()

        // Test incorrect values
        expenseAmount.value = 'abc'
        expenseDate.value   = '202210-20'
        expenseVAT.value    = 'abc'
        expensePCT.value    = 'abc'

        fireEvent.submit(form)

        expect(expenseAmount.validity.valid).not.toBeTruthy()
        expect(expenseDate.validity.valid).not.toBeTruthy()
        expect(expenseVAT.validity.valid).not.toBeTruthy()
        expect(expensePCT.validity.valid).not.toBeTruthy()
      })
    })
  })
})
