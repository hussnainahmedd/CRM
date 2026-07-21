export async function sendDailyReport(reportData: any) {
  console.log("Triggering WhatsApp report generation...")
  
  const targetNumber = "923283637461" // User's testing number (Pakistani format)

  const message = `
*SADIQ CLINIC*
_Daily Collection & Patient Report_

*Date:* ${new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
---------------------------------

*1. PATIENT SUMMARY*
\u2022 Total Patients: *${reportData.totalPatients}*
\u2022 Flagged for Review: *${reportData.flaggedCount}*

*2. CLINICAL SERVICES*
\u2022 Checkups: ${reportData.services.checkup}
\u2022 Drips/Injections: ${reportData.services.drip}
\u2022 Gynae Consults: ${reportData.services.gynae}
\u2022 General Clinic: ${reportData.services.general}

*3. FINANCIAL SUMMARY*
\u2022 Total Revenue: *Rs. ${reportData.totalCollected.toLocaleString()}*
  - Cash Collected: Rs. ${reportData.cashCollected.toLocaleString()}
  - Online Transfers: Rs. ${reportData.onlineCollected.toLocaleString()}
---------------------------------
_End of Report_
  `.trim()

  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`

  // Open WhatsApp in a new tab
  window.open(whatsappUrl, "_blank")
}
