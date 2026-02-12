import { get, post, put, del } from '../request'

const buildCommentPath = (boardType, postId, commentId = '') =>
  `/api/boards/${boardType}/${postId}/comments${commentId ? `/${commentId}` : ''}`

export const fetchBoardComments = (boardType, postId) =>
  get(buildCommentPath(boardType, postId))

export const createBoardComment = (boardType, postId, { content, guestName, guestPassword }) =>
  post(buildCommentPath(boardType, postId), {
    content,
    guestName,
    guestPassword,
  })

export const updateBoardComment = (
  boardType,
  postId,
  commentId,
  { content, guestName, guestPassword },
) =>
  put(buildCommentPath(boardType, postId, commentId), {
    content,
    guestName,
    guestPassword,
  })

export const deleteBoardComment = (boardType, postId, commentId, { guestName, guestPassword }) =>
  del(buildCommentPath(boardType, postId, commentId), {
    params: {
      guestName,
      guestPassword,
    },
  })
