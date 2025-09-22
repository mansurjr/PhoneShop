import React, { useState } from "react";
import {
  usePhones,
  useAddPhone,
  useUpdatePhone,
  useDeletePhone,
} from "../api/hooks/useOhoneQueries";
import {
  Layout,
  Input,
  InputNumber,
  Button,
  Typography,
  Spin,
  Alert,
  Row,
  Col,
  Card,
  Select,
  Tag,
  Switch,
  Form,
  Space,
  Modal,
  Image,
  Tooltip,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

export interface Phone {
  id: string;
  title: string;
  price: string;
  image: string[];
  memories: number[];
  hasDelivery: boolean;
  colours: string[];
}

export type NewPhone = Omit<Phone, "id">;

const memoryOptions = [8, 16, 32, 64, 128, 256, 512, 1024].map((mem) => ({
  label: `${mem} GB`,
  value: mem,
}));
const colorOptions = [
  "Black",
  "White",
  "Silver",
  "Gold",
  "Blue",
  "Red",
  "Green",
].map((color) => ({
  label: color,
  value: color,
}));

const { Title, Text } = Typography;

const PhoneManager: React.FC = () => {
  const { data: phones, isLoading, isError, error } = usePhones();
  const addPhone = useAddPhone();
  const updatePhone = useUpdatePhone();
  const deletePhone = useDeletePhone();

  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);

  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleAddImageUrl = () => {
    if (currentImageUrl.trim() && !imageUrls.includes(currentImageUrl.trim())) {
      setImageUrls((prev) => [...prev, currentImageUrl.trim()]);
      setCurrentImageUrl("");
    }
  };

  const handleRemoveImageUrl = (urlToRemove: string) => {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const resetForm = () => {
    form.resetFields();
    setImageUrls([]);
    setCurrentImageUrl("");
    setEditingPhone(null);
  };

  const handleSubmit = (values: any) => {
    const phoneData: NewPhone = {
      ...values,
      price: values.price.toString(),
      image: imageUrls,
      hasDelivery: !!values.hasDelivery,
    };

    if (editingPhone) {
      updatePhone.mutate(
        { ...editingPhone, ...phoneData },
        {
          onSuccess: () => {
            resetForm();
            setIsModalOpen(false);
          },
        }
      );
    } else {
      // add
      addPhone.mutate(phoneData, {
        onSuccess: () => {
          resetForm();
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleEdit = (phone: Phone) => {
    setEditingPhone(phone);
    setImageUrls(phone.image);
    form.setFieldsValue({
      title: phone.title,
      price: Number(phone.price),
      memories: phone.memories,
      colours: phone.colours,
      hasDelivery: phone.hasDelivery,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}>
        <Spin tip="Loading phones..." size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "50px" }}>
        <Alert
          message="Error"
          description={error?.message || "Failed to fetch data"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <Layout style={{ padding: "24px" }} className="container">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Phone Manager
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}>
          Add Phone
        </Button>
      </Row>

      <Modal
        title={editingPhone ? "Edit Phone" : "Add New Phone"}
        open={isModalOpen}
        onCancel={() => {
          resetForm();
          setIsModalOpen(false);
        }}
        footer={null}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ marginTop: "16px" }}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input a title!" }]}>
            <Input placeholder="e.g., iPhone 15 Pro" />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input a price!" }]}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="e.g., 999"
              addonAfter="$"
            />
          </Form.Item>

          <Form.Item label="Memories (GB)" name="memories" initialValue={[]}>
            <Select
              mode="multiple"
              allowClear
              options={memoryOptions}
              placeholder="Select memory options"
            />
          </Form.Item>

          <Form.Item label="Colours" name="colours" initialValue={[]}>
            <Select
              mode="tags"
              allowClear
              options={colorOptions}
              placeholder="Select or type custom colours"
            />
          </Form.Item>

          <Form.Item label="Add Image URLs">
            <>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="https://example.com/image.png"
                  value={currentImageUrl}
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                  onPressEnter={handleAddImageUrl}
                />
                <Button type="primary" onClick={handleAddImageUrl}>
                  Add
                </Button>
              </Space.Compact>
              <div style={{ marginTop: 8, maxWidth: "100%" }}>
                {imageUrls.map((url) => (
                  <Tooltip title={url} key={url}>
                    <Tag
                      closable
                      onClose={() => handleRemoveImageUrl(url)}
                      style={{
                        marginBottom: 4,
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                      }}>
                      {url}
                    </Tag>
                  </Tooltip>
                ))}
              </div>
            </>
          </Form.Item>

          <Form.Item
            label="Has Delivery"
            name="hasDelivery"
            valuePropName="checked"
            initialValue={false}>
            <Switch />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={addPhone.isPending || updatePhone.isPending}
            block>
            {editingPhone
              ? updatePhone.isPending
                ? "Updating..."
                : "Update Phone"
              : addPhone.isPending
              ? "Adding..."
              : "Add Phone"}
          </Button>
        </Form>
      </Modal>

      <Title level={3}>Phone List</Title>
      <Row gutter={[16, 16]}>
        {phones?.map((phone: Phone) => (
          <Col key={phone.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              cover={
                <Image
                  alt={phone.title}
                  src={
                    phone.image[0] ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  style={{ height: 200, objectFit: "contain", padding: 8 }}
                  preview={{
                    src:
                      phone.image[0] ||
                      "https://via.placeholder.com/300x200?text=No+Image",
                  }}
                  fallback="https://via.placeholder.com/300x200?text=Image+Failed"
                />
              }
              actions={[
                <Button
                  type="link"
                  onClick={() => handleEdit(phone)}
                  key="edit">
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Are you sure you want to delete this phone?"
                  onConfirm={() => deletePhone.mutate(phone.id)}
                  okText="Yes"
                  cancelText="No">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={
                      deletePhone.isPending &&
                      deletePhone.variables === phone.id
                    }
                  />
                </Popconfirm>,
              ]}>
              <Card.Meta
                title={phone.title}
                description={
                  <Title level={4} style={{ color: "#52c41a", margin: 0 }}>
                    ${phone.price}
                  </Title>
                }
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  Delivery: {phone.hasDelivery ? "Available" : "Not Available"}
                </Text>
                <div style={{ margin: "8px 0" }}>
                  <Text strong>Memories: </Text>
                  {phone.memories.length > 0 ? (
                    phone.memories.map((mem) => (
                      <Tag color="blue" key={mem}>{`${mem} GB`}</Tag>
                    ))
                  ) : (
                    <Text type="secondary">N/A</Text>
                  )}
                </div>
                <div>
                  <Text strong>Colours: </Text>
                  {phone.colours.length > 0 ? (
                    phone.colours.map((color) => <Tag key={color}>{color}</Tag>)
                  ) : (
                    <Text type="secondary">N/A</Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default PhoneManager;
