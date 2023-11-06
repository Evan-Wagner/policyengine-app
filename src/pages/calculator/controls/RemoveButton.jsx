import {
    DeleteOutlined
} from "@ant-design/icons";
import { Button } from "antd";

export default function RemoveButton(props) {
    return (
        <Button style={props.style || {width: "36px", padding: "0px"}} onClick={() => props.remove(props.id)}>
            <DeleteOutlined />
        </Button>
    );
}