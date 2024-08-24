
export const queryFormat=(message:any) => {
    return `QUERY RAW ===  method => [ ${message.method} ] , query => [ ${message.sql} ], parameters => [ ${message.bindings} ]`
}

export const responseFormat=(message:any) => {
    return `RESPONSE ===  ${JSON.stringify(message)}`
}

export const errorFormat=(message:any) => {
    return `ERROR ===  ${JSON.stringify(message)}`
}

export const requestApiFormatSuccess=(url:any,request:any,response:any ,servicio=null) => {
    return `RESPONSE === {servicio:'${servicio}', url:'${url}', request:'${JSON.stringify(request)}', response:'${JSON.stringify(response)}'`
}

export const requestApiFormatError=(url:any,request:any,response:any ,servicio=null) => {
    return `ERROR === {servicio:'${servicio}', url:'${url}', request:'${JSON.stringify(request)}', response:'${JSON.stringify(response)}'`
}

export const requestViewIntegration=(servicio=null,request:any,response:any) => {
    return `RESPONSE === {servicio:'${servicio}', query_request:'${String(request)}', query_response:'${JSON.stringify(response)}' }`
}
