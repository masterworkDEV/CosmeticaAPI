const Admin_Secret_Key = parseInt(process.env.ADMIN_KEY);
const Editor_Secret_Key = parseInt(process.env.EDITOR_KEY);

const ROLES_LIST = {
  Admin: Admin_Secret_Key,
  Editor: Editor_Secret_Key,
  User: 2001,
};

module.exports = ROLES_LIST;
