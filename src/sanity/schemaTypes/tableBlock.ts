const tableBlock = {
  name: 'tableBlock',
  type: 'object',
  title: 'Table',
  fields: [
    {
      name: 'rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'cells',
              type: 'array',
              of: [{type: 'string'}]
            }
          ]
        }
      ]
    }
  ]
}

export default tableBlock
