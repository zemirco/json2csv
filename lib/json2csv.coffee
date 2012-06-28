exports.parse = (params) ->
  params.data = JSON.parse JSON.stringify params.data
  if checkFields(params)
    createColumnTitles params, createColumnContent
  
checkFields = (params) ->
  for name in params.fields
    found = false
    for key, value of params.data[0]
      if key is name
        found = true
        break
    if found is false
      throw new Error "Cannot find #{name} as a json key"
    else
      return true
  
createColumnTitles = (params, callback) ->
  str = ''
  for elem in params.fields
    if str isnt ''
      str += ','
    str += elem
  callback params, str
    
createColumnContent = (params, str) ->
  for elem in params.data
    line = ''
    for field in params.fields
      if line isnt ''
        line += ','
      line += JSON.stringify elem[field]
    line = line.replace(/\\"/g, '""');
    str += '\r\n' + line
  return str