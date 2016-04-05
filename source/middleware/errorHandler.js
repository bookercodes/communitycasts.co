// @flow

export default function(err:any, req:any, res:any) {
  res.status(500).send(err)
}
