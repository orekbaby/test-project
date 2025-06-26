const { ApiError } = require("../../utils");
const {
  getNoticeRecipients,
  getNoticeById,
  addNewNotice,
  updateNoticeById,
  manageNoticeStatus,
  getNotices,
  addNoticeRecipient,
  updateNoticeRecipient,
  getNoticeRecipientList,
  deleteNoticeRecipient,
  getNoticeRecipientById,
  getAllPendingNotices,
} = require("./notices-repository");

const fetchNoticeRecipients = async () => {
  try {
    const recipients = await getNoticeRecipientList();
    if (!Array.isArray(recipients) || recipients.length <= 0) {
      throw new ApiError(404, "Recipients not found");
    }
    return recipients;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to fetch notice recipients");
  }
};

const processGetNoticeRecipients = async () => {
  try {
    const recipients = await getNoticeRecipients();
    if (!Array.isArray(recipients) || recipients.length <= 0) {
      throw new ApiError(404, "Recipients not found");
    }
    return recipients;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to get notice recipients");
  }
};

const processGetNoticeRecipient = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, "Recipient ID is required");
    }

    const recipient = await getNoticeRecipientById(id);
    if (!recipient) {
      throw new ApiError(404, "Recipient detail not found");
    }

    return recipient;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to get notice recipient");
  }
};

const fetchAllNotices = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const notices = await getNotices(userId);
    if (!Array.isArray(notices) || notices.length <= 0) {
      throw new ApiError(404, "Notices not found");
    }
    return notices;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to fetch notices");
  }
};

const fetchNoticeDetailById = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, "Notice ID is required");
    }

    const noticeDetail = await getNoticeById(id);
    if (!noticeDetail) {
      throw new ApiError(404, "Notice detail not found");
    }
    return noticeDetail;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to fetch notice detail");
  }
};

const addNotice = async (payload) => {
  try {
    // Validate required fields
    const { title, description, authorId } = payload;
    if (!title || !description || !authorId) {
      throw new ApiError(400, "Title, description, and author ID are required");
    }

    // Ensure description is properly included in payload
    const noticePayload = {
      ...payload,
      title: title.trim(),
      description: description.trim(),
    };

    const result = await addNewNotice(noticePayload);
    if (!result || result.rowCount <= 0) {
      throw new ApiError(500, "Unable to add new notice");
    }

    return {
      message: "Notice added successfully",
      noticeId: result.insertedId,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to add notice");
  }
};

const updateNotice = async (payload) => {
  try {
    // Validate required fields
    const { id, title, description } = payload;
    if (!id || !title || !description) {
      throw new ApiError(400, "ID, title, and description are required");
    }

    // Ensure description is properly included in payload
    const noticePayload = {
      ...payload,
      title: title.trim(),
      description: description.trim(),
    };

    const affectedRow = await updateNoticeById(noticePayload);
    if (affectedRow <= 0) {
      throw new ApiError(500, "Unable to update notice");
    }

    return { message: "Notice updated successfully" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to update notice");
  }
};

const processNoticeStatus = async (payload) => {
  try {
    const { noticeId, status, currentUserId, currentUserRole } = payload;

    // Validate required fields
    if (
      !noticeId ||
      status === undefined ||
      !currentUserId ||
      !currentUserRole
    ) {
      throw new ApiError(
        400,
        "Notice ID, status, user ID, and user role are required"
      );
    }

    const notice = await getNoticeById(noticeId);
    if (!notice) {
      throw new ApiError(404, "Notice not found");
    }

    const now = new Date();
    const {
      authorId,
      reviewer_id: reviewerIdFromDB,
      reviewed_dt: reviewedDateFromDB,
    } = notice;

    const userCanManageStatus = handleStatusCheck(
      currentUserRole,
      currentUserId,
      authorId,
      status
    );

    if (!userCanManageStatus) {
      throw new ApiError(
        403,
        "Forbidden. You do not have permission to access this resource."
      );
    }

    const affectedRow = await manageNoticeStatus({
      noticeId,
      status,
      reviewerId:
        currentUserRole === "admin" ? currentUserId : reviewerIdFromDB,
      reviewDate: currentUserRole === "admin" ? now : reviewedDateFromDB,
    });

    if (affectedRow <= 0) {
      throw new ApiError(500, "Unable to update notice status");
    }

    return { message: "Notice status updated successfully" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to process notice status");
  }
};

const handleStatusCheck = (
  currentUserRole,
  currentUserId,
  authorId,
  status
) => {
  // Admin can manage any status
  if (currentUserRole === "admin") {
    return true;
  }

  // Author can only manage certain statuses
  if (authorId === currentUserId) {
    // Define allowed statuses for authors (1: draft, 2: pending, 3: submitted)
    const allowedStatuses = [1, 2, 3];
    return allowedStatuses.includes(status);
  }

  return false;
};

const processAddNoticeRecipient = async (payload) => {
  try {
    const { roleId } = payload;
    if (!roleId) {
      throw new ApiError(400, "Role ID is required");
    }

    const result = await addNoticeRecipient(payload);
    if (!result || result.rowCount <= 0) {
      throw new ApiError(500, "Unable to add notice recipient");
    }

    return {
      message: "Notice recipient added successfully",
      recipientId: result.insertedId,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to add notice recipient");
  }
};

const processUpdateNoticeRecipient = async (payload) => {
  try {
    const { id, roleId } = payload;
    if (!id || !roleId) {
      throw new ApiError(400, "ID and Role ID are required");
    }

    const affectedRow = await updateNoticeRecipient(payload);
    if (affectedRow <= 0) {
      throw new ApiError(500, "Unable to update notice recipient");
    }

    return { message: "Notice recipient updated successfully" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to update notice recipient");
  }
};

const processDeleteNoticeRecipient = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, "Recipient ID is required");
    }

    const affectedRow = await deleteNoticeRecipient(id);
    if (affectedRow <= 0) {
      throw new ApiError(500, "Unable to delete notice recipient");
    }

    return { message: "Notice recipient deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to delete notice recipient");
  }
};

const processGetAllPendingNotices = async () => {
  try {
    const notices = await getAllPendingNotices();
    if (!Array.isArray(notices) || notices.length <= 0) {
      throw new ApiError(404, "Pending notices not found");
    }

    return notices;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to get pending notices");
  }
};

module.exports = {
  fetchNoticeRecipients,
  fetchAllNotices,
  fetchNoticeDetailById,
  addNotice,
  updateNotice,
  processNoticeStatus,
  processAddNoticeRecipient,
  processUpdateNoticeRecipient,
  processGetNoticeRecipients,
  processDeleteNoticeRecipient,
  processGetNoticeRecipient,
  processGetAllPendingNotices,
};
