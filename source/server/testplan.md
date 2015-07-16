#Test Plan

_This document outlines the functionality that is missing tests_


- `screencastsController.redirectToScreencast`
  1. should return 404 if no screencast with given id exists
  - should redirect to screencast link
  - should increment referral count
  - should only increment referral count once per IP
- `screencastsController.createScreencast`
  1. should return error if link is not YouTube or Vimeo link
  - should return error if link is blank
  - should return error if tags is blank
  - should return error if there are more than 5 tags
  - should insert screencast into screencasts table
  - should insert tags into tags table if they do not already exist
  - should return message if screencast is successfully processed
  - should use the youtube client
  - should use the vimeo client
- `screencastsController.sendScreencasts`
  1. hasMore property should be true if there is another page
  - hasMore property should be false if there is not another page
  - should order screencasts, most referred first
  - should only return screencasts for given period (today/week/month)
  - should paginate correctly (whatever that means)
  - screencasts should have tags array
  - screencasts should have href property
  - screencasts should not have link
