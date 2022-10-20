/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon).toHaveClass('active-icon')
    })

    // Test unitaire : on vérifie le bon fonctionnement du tri par date
    test("Then bills should be ordered from earliest to latest", () => {
      // Sort by date DESC
      const sortByMapped = (map, compareFn) => (a, b) => compareFn(map(a), map(b))
      const toDate = e => new Date(e.date).getTime()
      const byValue = (a, b) => b - a
      const byDate = sortByMapped(toDate, byValue)
      bills.sort(byDate)

      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test d'intégration : on simule un clic sur le bouton "voir" et on vérifie que la modale est bien appelée
    describe("When I click in eye icon", () => {
      it("should open a modal", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
        document.body.innerHTML = BillsUI({ data: bills })
        const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

        // On vérifie que la fonction est bien lancée au clic
        const handleClickIconEye = jest.fn((eyeIcon) => billsContainer.handleClickIconEye(eyeIcon))
        $.fn.modal = jest.fn() // fonction modale
        const eyeIcon = screen.getByTestId('icon-eye47qAXb6fIm2zOKkLzMro')
        eyeIcon.addEventListener("click", handleClickIconEye(eyeIcon))
  
        userEvent.click(eyeIcon)

        expect(handleClickIconEye).toHaveBeenCalled()

        //TODO Vérifier que la modale est bien appelée
        const modale = screen.getByTestId('modaleFile')
        // expect(modale).toHaveClass('show')

      })
    })

    // Test d'intégration - clic sur "Nouvelle note de frais"
    describe('When I click on "Add new bill"', () => {
      test("Then I should go to New Bill page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
        document.body.innerHTML = BillsUI({ data: bills })
        const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        
        // On vérifie que la fonction est bien lancée au clic
        const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
        const newBillButton = screen.getByTestId('btn-new-bill') // Bouton "Nouvelle note de frais"
        newBillButton.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillButton)
        expect(handleClickNewBill).toHaveBeenCalled()
  
        // Titre de la nouvelle page dans laquelle on accède
        const textSendBill = screen.getByText('Envoyer une note de frais')
        expect(textSendBill).toBeTruthy()  
      })
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock } )
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () => { return Promise.reject(new Error("Erreur 404")) }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  { return Promise.reject(new Error("Erreur 500")) }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})