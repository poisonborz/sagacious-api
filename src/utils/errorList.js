
export const errorList = {
    same_type_and_serial: { message: 'The serial number must be different to other articles when they have the same type.', httpStatus: 401 },
    id_invalid: { message: 'Invalid item id', httpStatus: 401 },
    login_invalid: { message: 'Invalid login credentials', httpStatus: 401 },
    timestamp_invalid: { message: 'Invalid timestamp value', httpStatus: 401 },
    permission_error: { message: 'No permissions to access one or more resources in the request', httpStatus: 403 },
    no_refresh_token: { message: 'No refresh token provided.', httpStatus: 422 },
    expired_token: { message: 'Expired token. Please log in again.', httpStatus: 401 },
    invalid_token: { message: 'Your token is invalid or expired. Please log in again.', httpStatus: 401 },
    internal_error: { message: 'An internal error occured processing the request. Please try again later or contact our support.', httpStatus: 500 },
    no_perm_group: { message: 'No permission to create a user for this group', httpStatus: 403 },
    group_noop: { message: 'Invalid operation for this group', httpStatus: 403 },
    group_name_required: { message: 'Group name is required', httpStatus: 403 },
    group_selfparent: { message: 'A group cannot be reassigned to itself or any of its children', httpStatus: 403 },
    group_delchildren: { message: 'This group cannot be deleted because it is the parent of another group', httpStatus: 403 },
    group_delarticles: { message: 'This group cannot be removed, because it has articles assigned', httpStatus: 403 },
    group_delusers: { message: 'This group cannot be removed, because it has users assigned', httpStatus: 403 },
    no_perm_childgroup: { message: 'No permission to create a child group of this group', httpStatus: 403 },
    cant_delete_articletype_articles: { message: 'Cannot delete ArticleType. Articles are still connected to it.', httpStatus: 501 },
    cant_delete_articlecat_articles: { message: 'Cannot delete ArticleCategory. Articles are still connected to it.', httpStatus: 501 },
    cant_delete_articlecat_types: { message: 'Cannot delete ArticleCategory. Article Types are still connected with this category.', httpStatus: 403 },
    req_articletypename: { message: 'Article Type name is required', httpStatus: 422 },
    req_articlecatname: { message: 'Article Category name is required', httpStatus: 422 },
    article_missing: { message: 'Article not found', httpStatus: 404 },
    serial_missing: { message: 'Serial is missing', httpStatus: 404 },
    type_missing: { message: 'Type is missing', httpStatus: 404 },
}

// Most common client errors that make sense also in a graphql context.
// Status code will not be used in graphql.
// Messages are just sane defaults, provide more informative ones when creating a `HttpError`
export const generalCodes = {
    bad_request: { message: 'Bad Request', httpStatus: 400 },
    unauthorized: { message: 'Unauthorized', httpStatus: 401 },
    forbidden: { message: 'Forbidden', httpStatus: 403 },
    not_found: { message: 'Not Found', httpStatus: 404 },
    method_not_allowed: { message: 'Method Not Allowed', httpStatus: 405 },
    conflict: { message: 'Conflict', httpStatus: 409 },
    unprocessable_entity: { message: 'Unprocessable Entity', httpStatus: 422 }
}
