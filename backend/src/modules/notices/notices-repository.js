const { db } = require("../../config");
const { processDBRequest } = require("../../utils");

const getNotices = async (userId) => {
  const query = `SELECT * FROM get_notices($1)`;
  const queryParams = [userId];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows;
};

const getAllPendingNotices = async () => {
  const query = `
    SELECT
        t1.id,
        t1.title,
        t1.description,
        t1.author_id AS "authorId",
        t1.created_dt AS "createdDate",
        t1.updated_dt AS "updatedDate",
        t2.name AS author,
        t4.name AS "reviewerName",
        t1.reviewed_dt AS "reviewedDate",
        t3.alias AS "status",
        t1.status AS "statusId",
        NULL AS "whoHasAccess"
    FROM notices t1
    LEFT JOIN users t2 ON t1.author_id = t2.id
    LEFT JOIN notice_status t3 ON t1.status = t3.id
    LEFT JOIN users t4 ON t1.reviewer_id = t4.id
    WHERE t1.status IN (2, 3)
  `;
  const { rows } = await processDBRequest({ query });
  return rows;
};

const getNoticeById = async (id) => {
  const query = `
    SELECT
        t1.id,
        t1.title,
        t1.description,
        t1.status,
        t1.author_id AS "authorId",
        t1.created_dt AS "createdDate",
        t1.updated_dt AS "updatedDate",
        t1.recipient_type AS "recipientType",
        t1.recipient_role_id AS "recipientRole",
        t1.recipient_first_field AS "firstField",
        t1.reviewer_id,
        t1.reviewed_dt,
        t2.name AS author
    FROM notices t1
    LEFT JOIN users t2 ON t1.author_id = t2.id
    WHERE t1.id = $1
  `;
  const queryParams = [id];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows[0];
};

const addNewNotice = async (payload) => {
  const now = new Date();
  const {
    title,
    description,
    status,
    recipientType,
    recipientRole,
    firstField: recipientFirstField,
    authorId,
  } = payload;

  // Validate required fields
  if (!title || !description || !authorId) {
    throw new Error("Title, description, and authorId are required fields");
  }

  const query = `
    INSERT INTO notices
    (title, description, status, recipient_type, recipient_role_id, recipient_first_field, created_dt, author_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;

  const queryParams = [
    title,
    description,
    status || 1, // Default status if not provided
    recipientType,
    recipientRole,
    recipientFirstField,
    now,
    authorId,
  ];

  const { rows, rowCount } = await processDBRequest({ query, queryParams });
  return { rowCount, insertedId: rows[0]?.id };
};

const updateNoticeById = async (payload) => {
  const now = new Date();
  const {
    id,
    title,
    description,
    status,
    recipientType,
    recipientRole,
    firstField,
  } = payload;

  // Validate required fields
  if (!id || !title || !description) {
    throw new Error("ID, title, and description are required fields");
  }

  const query = `
    UPDATE notices
    SET
        title = $1,
        description = $2,
        status = $3,
        recipient_type = $4,
        recipient_role_id = $5,
        recipient_first_field = $6,
        updated_dt = $7
    WHERE id = $8
  `;

  const queryParams = [
    title,
    description,
    status,
    recipientType,
    recipientRole,
    firstField,
    now,
    id,
  ];

  const { rowCount } = await processDBRequest({ query, queryParams });
  return rowCount;
};

const getNoticeRecipientList = async () => {
  try {
    const noticeRecipientTypesQuery =
      "SELECT * FROM notice_recipient_types ORDER BY id";
    const { rows: noticeRecipientTypes } = await db.query(
      noticeRecipientTypesQuery
    );

    if (noticeRecipientTypes.length <= 0) {
      return [];
    }

    const recipientPromises = noticeRecipientTypes.map(
      async (recipientType) => {
        const {
          id,
          role_id,
          primary_dependent_name,
          primary_dependent_select,
        } = recipientType;

        const selectRoleQuery = `SELECT name FROM roles WHERE id = $1`;
        const { rows } = await db.query(selectRoleQuery, [role_id]);

        if (rows.length === 0) {
          throw new Error(`Role with id ${role_id} not found`);
        }

        const recipient = {
          id,
          roleId: role_id,
          name: rows[0].name,
        };

        const { rows: dependentRows } = primary_dependent_select
          ? await db.query(primary_dependent_select)
          : { rows: [] };

        recipient.primaryDependents = {
          name: primary_dependent_name,
          list: dependentRows,
        };

        return recipient;
      }
    );

    const result = await Promise.all(recipientPromises);
    return result;
  } catch (error) {
    throw error;
  }
};

const getNoticeRecipients = async () => {
  const query = `
    SELECT
        t1.id,
        t1.role_id AS "roleId",
        t1.primary_dependent_name AS "primaryDependentName",
        t1.primary_dependent_select AS "primaryDependentSelect",
        t2.name as "roleName"
    FROM notice_recipient_types t1
    JOIN roles t2 ON t1.role_id = t2.id
    ORDER BY t1.id
  `;
  const { rows } = await processDBRequest({ query });
  return rows;
};

const addNoticeRecipient = async (payload) => {
  const { roleId, primaryDependentName, primaryDependentSelect } = payload;

  // Validate required fields
  if (!roleId) {
    throw new Error("Role ID is required");
  }

  const query = `
    INSERT INTO notice_recipient_types
        (role_id, primary_dependent_name, primary_dependent_select)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  const queryParams = [roleId, primaryDependentName, primaryDependentSelect];
  const { rows, rowCount } = await processDBRequest({ query, queryParams });
  return { rowCount, insertedId: rows[0]?.id };
};

const updateNoticeRecipient = async (payload) => {
  const { id, roleId, primaryDependentName, primaryDependentSelect } = payload;

  // Validate required fields
  if (!id || !roleId) {
    throw new Error("ID and Role ID are required fields");
  }

  const query = `
    UPDATE notice_recipient_types
    SET
        primary_dependent_name = $1,
        primary_dependent_select = $2
    WHERE id = $3 AND role_id = $4
  `;

  const queryParams = [
    primaryDependentName,
    primaryDependentSelect,
    id,
    roleId,
  ];

  const { rowCount } = await processDBRequest({ query, queryParams });
  return rowCount;
};

const deleteNoticeRecipient = async (id) => {
  if (!id) {
    throw new Error("ID is required for deletion");
  }

  const query = `DELETE FROM notice_recipient_types WHERE id = $1`;
  const queryParams = [id];
  const { rowCount } = await processDBRequest({ query, queryParams });
  return rowCount;
};

const getNoticeRecipientById = async (id) => {
  if (!id) {
    throw new Error("ID is required");
  }

  const query = `
    SELECT
        id,
        role_id AS "roleId",
        primary_dependent_name AS "primaryDependentName",
        primary_dependent_select AS "primaryDependentSelect"
    FROM notice_recipient_types 
    WHERE id = $1
  `;

  const queryParams = [id];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows[0];
};

const manageNoticeStatus = async (payload) => {
  const { status, reviewerId, noticeId, reviewDate } = payload;

  // Validate required fields
  if (!noticeId || status === undefined) {
    throw new Error("Notice ID and status are required");
  }

  const query = `
    UPDATE notices
    SET
        status = $1,
        reviewed_dt = $2,
        reviewer_id = $3
    WHERE id = $4
  `;

  const queryParams = [status, reviewDate, reviewerId, noticeId];
  const { rowCount } = await processDBRequest({ query, queryParams });
  return rowCount;
};

module.exports = {
  getNoticeById,
  addNewNotice,
  updateNoticeById,
  getNoticeRecipientList,
  getNoticeRecipients,
  manageNoticeStatus,
  getNotices,
  addNoticeRecipient,
  updateNoticeRecipient,
  deleteNoticeRecipient,
  getNoticeRecipientById,
  getAllPendingNotices,
};
