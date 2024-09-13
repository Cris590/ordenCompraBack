export const formatDate = (dateString:string) =>{

    let date = new Date(dateString)
    return date.toLocaleString()
}