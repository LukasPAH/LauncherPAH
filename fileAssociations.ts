export const fileAssociations = ["mcpack", "mcworld"];

export const fileAssociationString = () => {
    let string = ""
    for (let i = 0; i < fileAssociations.length; i++) {
        const fileAssociation = fileAssociations[i];
        string += fileAssociation;
        if (i + 1 !== fileAssociations.length) string += ","
    }
    return string;
}