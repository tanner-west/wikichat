export async function queryWikipedia(encodedSearchTerm: string) {
  try{
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodedSearchTerm}`)
    const data: any = await res.json()
    return {titles: data[1], urls: data[3]}
  } catch {
    console.log('error')
  }
}
