import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (billId, billUrl) => {
  return (
    `<div class="icon-actions">
      <div class="eye" data-testid="icon-eye${billId}" data-bill-url="${billUrl}">
      ${eyeBlueIcon}
      </div>
    </div>`
  )
}