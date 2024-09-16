const fs = require("fs");
const path = require("path");

// @ts-ignore
import Handlebars from "handlebars";
const DEV = process.env.DEV || ''

// @ts-ignore
import htmlToPdf from '../utils/html-pdf-puppeteer'

Handlebars.registerHelper('compareSex', function (value1, value2) {

    return value1 === value2
});

export const crearDocumentoPdfWK = async (data: any, template_name: string, titulo_pdf = 'default', folder_save = 'storage', header = '') => {
    try {
        console.log('------- PATH TEMPLATE -------')
        console.log(path.join(process.cwd(), `${DEV}/templates/${template_name}.html`))
        var templateHtml = fs.readFileSync(
            path.join(process.cwd(), `${DEV}/templates/${template_name}.html`),
            "utf8"
        );


        var template = Handlebars.compile(templateHtml);
        var html = template(data);

        var pdfPath = path.join(process.cwd(), `documents_storage/${folder_save}/`, `${titulo_pdf}.pdf`);

        let pdf = await generatePdf(pdfPath, html)
        return pdf
    } catch (e) {
        console.log('XXXXX ERROR XXXXXX')
        console.log(e)
        return {
            error: 1,
            message: e,
        };
    }
};

const generatePdf = async (pdfPath: string, html: string): Promise<{ error: number, message: string }> => {
    try {
        let customHeader = ''
        let customFooter = ''
        let html_to_pdf = htmlToPdf;
        let margin = {
            top: "30px",
            bottom: "30px",
            left: "30px",
            right: "30px"
        }

        let options = {
            format: "A4",
            margin,
            printBackground: true,
            path: pdfPath,
            displayHeaderFooter: customHeader.length > 0,
            headerTemplate: customHeader,
            footerTemplate: customFooter,
        };

        let file = { content: html };
        await html_to_pdf.generatePdf(file, options)
        return {
            error: 0,
            message: "ok"
        }

    } catch (e) {
        console.log('*** ERROR CREAR DOCUMENTO ****')
        console.log(e)
        return {
            error: 1,
            message: "Error al crear el documento" + String(e)
        }
    }
};


