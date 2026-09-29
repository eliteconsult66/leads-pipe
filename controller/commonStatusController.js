module.exports.toggleStatus = (Model) => {

    return async (req, res) => {

        try {

            const item = await Model.findById(req.params.id);

            item.status =
                item.status === 'Active'
                    ? 'Inactive'
                    : 'Active';

            await item.save();

            res.json({
                success: true,
                status: item.status
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false,
                error: err.message
            });

        }

    };

};

module.exports.toggleField = async (
    Model,
    id,
    field,
    value1,
    value2
) => {

    const document = await Model.findById(id);

    if (!document) {
        throw new Error("Record not found");
    }

    document[field] =
        document[field] === value1
            ? value2
            : value1;

    await document.save();

    return document;
};

module.exports.toggleHeader = async (
    Model,
    id,
    field,
    value1,
    value2
) => {

    const document = await Model.findById(id);

    if (!document) {
        throw new Error("Record not found");
    }

    document[field] =
        document[field] === value1
            ? value2
            : value1;

    await document.save();

    return document;
};

module.exports.toggleFooter = async (
    Model,
    id,
    field,
    value1,
    value2
) => {

    const document = await Model.findById(id);

    if (!document) {
        throw new Error("Record not found");
    }

    document[field] =
        document[field] === value1
            ? value2
            : value1;

    await document.save();

    return document;
};