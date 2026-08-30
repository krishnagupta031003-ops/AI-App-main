const User = require("./authModel");

const createUser = async (userData) => {
    return User.create(userData);
};

const findUserByEmail = async (email, includePassword = false) => {
    let query = User.findOne({ email });

    if (includePassword) {
        query = query.select("+password");
    }

    return query;
};

const findUserById = async (id, includePassword = false) => {
    let query = User.findById(id);

    if (includePassword) {
        query = query.select("+password");
    }

    return query;
};

const updateUserById = async (id, updateData) => {
    return User.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
};

const deleteUserById = async (id) => {
    return User.findByIdAndDelete(id);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserById,
    deleteUserById,
};
