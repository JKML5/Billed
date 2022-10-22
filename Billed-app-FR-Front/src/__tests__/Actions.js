/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import Actions from "../views/Actions.js"
import '@testing-library/jest-dom/extend-expect'


describe('Given I am connected as an Employee', () => {
  describe('When I am on Bills page and there are bills', () => {
    test(('Then, it should render icon eye'), () => {
      const id = '47qAXb6fIm2zOKkLzMro';
      const html = Actions(id)

      document.body.innerHTML = html

      expect(screen.getByTestId('icon-eye47qAXb6fIm2zOKkLzMro')).toBeTruthy()
    })
  })

  describe('When I am on Bills page and there are bills with url for file', () => {
    test(('Then, it should save given url in data-bill-url custom attribute'), () => {
      const id = '47qAXb6fIm2zOKkLzMro';
      const url = '/fake_url'
      const html = Actions(id, url)

      document.body.innerHTML = html

      expect(screen.getByTestId('icon-eye47qAXb6fIm2zOKkLzMro')).toHaveAttribute('data-bill-url', url)
    })
  })
})
