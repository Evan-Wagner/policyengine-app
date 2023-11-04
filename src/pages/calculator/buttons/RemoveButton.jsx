import {
    DeleteOutlined
} from "@ant-design/icons";

export default function RemoveButton(props) {
    return (
        <button onClick={() => props.remove(props.id)}>
            <DeleteOutlined />
        </button>
    );
}