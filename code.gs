function doPost(e) {
    params = JSON.parse(e.postData.contents)
    const incoming_message = params.message;
    const phone_number = params.from;

    if (incoming_message == 'Gudang') {
        sendMenu(phone_number, 'Silahkan Masukkan No AMS')
        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Processed successfully',
        })).setMimeType(ContentService.MimeType.JSON);
    } else if (!isNaN(incoming_message)) {
        let foundRow = checkAms(Number(incoming_message))
        if (foundRow > -1) {
            let amsValue = checkAmsValue(foundRow)
            if (isEmpty(amsValue)) {
                sendMenu(phone_number, 'Belum ada data')
                return ContentService.createTextOutput(JSON.stringify({
                    status: 'success',
                    message: 'Processed successfully',
                })).setMimeType(ContentService.MimeType.JSON);
            } else {
                const message = `Saat ini Dokumen Sedang ada di ${amsValue.foundValue} dengan status ${amsValue.status}`
                sendMenu(phone_number, message)
                return ContentService.createTextOutput(JSON.stringify({
                    status: 'success',
                    message: 'Processed successfully',
                })).setMimeType(ContentService.MimeType.JSON);
            }
        } else {
            sendMenu(phone_number, 'No AMS Salah')
            return ContentService.createTextOutput(JSON.stringify({
                status: 'success',
                message: 'Processed successfully',
            })).setMimeType(ContentService.MimeType.JSON);
        }
    } else {
        sendMenu(phone_number, 'Inputan Salah')
        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Processed successfully',
        })).setMimeType(ContentService.MimeType.JSON);
    }

}

function sendMenu(number, message) {
    // Set the URL to which you want to send the POST request
    const url = "https://app.whacenter.com/api/send";

    // Prepare the data to be sent in the POST request
    const payload = {
        device_id: 'xxxxxxx',
        number: number,
        message: message
    };

    // Convert the payload into JSON
    const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
    };

    try {
        // Make the HTTP POST request
        const response = UrlFetchApp.fetch(url, options);

        // Parse the response
        const responseData = JSON.parse(response.getContentText());

        // Return success response to the original caller
        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Data sent successfully',
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        // Handle errors
        Logger.log('Error: ' + error.message);
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: 'Failed to send POST request',
            error: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function checkAms(no_ams) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    let rowFound = -1;
    // Get the data in Column B starting from Row 5
    const range = sheet.getRange('B5:B' + sheet.getLastRow());
    const values = range.getValues(); // 2D array containing all the values in the range

    // Search for the input number in the values
    for (let i = 0; i < values.length; i++) {
        if (values[i][0] == no_ams) { // Compare the value in Column B with the input
            rowFound = i + 5;
            break;
        }
    }
    return rowFound
}

function checkAmsValue(rowFound) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Check values from Columns J, I, H, G in the found row
    const rowRange = sheet.getRange('G' + rowFound + ':K' + rowFound).getValues();
    const rowData = rowRange[0]; // Row data for G, H, I, J, and K

    // Extract the values from G to K
    const valueG = rowData[0];
    const valueH = rowData[1];
    const valueI = rowData[2];
    const valueJ = rowData[3];
    const valueK = rowData[4]; // Value in Column K

    // Find the first non-empty value from J, I, H, G
    let foundValue = null;
    if (valueJ) {
        foundValue = 'Penilaian Vendor';
    } else if (valueI) {
        foundValue = 'Ketua';
    } else if (valueH) {
        foundValue = 'Anggota';
    } else if (valueG) {
        foundValue = 'Sekretaris';
    }

    if (foundValue !== null) {
        return {
            foundValue: foundValue,
            status: valueK
        }
    } else {
        return {}
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function convertPhoneNumber(phoneNumber) {
    // Check if the number starts with '62'
    if (phoneNumber.startsWith('62')) {
        // Replace '62' with '0' at the beginning of the number
        return '0' + phoneNumber.slice(2);
    }
    return phoneNumber; // If it doesn't start with '62', return the original number
}