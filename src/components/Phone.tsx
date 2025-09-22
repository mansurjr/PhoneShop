import React, { useState } from "react";
import { usePhone } from "../api/hooks/useOhoneQueries";
import {
  Input,
  InputNumber,
  Button,
  Spin,
  Alert,
  Modal,
  Form,
  Tag,
  Tooltip,
  Space,
  Switch,
  Select,
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

const PhoneManager: React.FC = () => {
  const { phones, addPhone, updatePhone, deletePhone } = usePhone();

  const { data: phoneList, isLoading, isError, error } = phones;

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
      <div className="flex items-center justify-center h-screen">
        <Spin tip="Loading phones..." size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12">
        <Alert
          message="Error"
          description={(error as Error)?.message || "Failed to fetch data"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Phone Manager</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}>
          Add Phone
        </Button>
      </div>

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
          className="mt-4">
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
              className="w-full"
              placeholder="e.g., 999"
              addonAfter="$"
            />
          </Form.Item>

          <Form.Item label="Memories (GB)" name="memories" initialValue={[]}>
            <Select
              mode="multiple"
              options={memoryOptions}
              placeholder="Select memory options"
            />
          </Form.Item>

          <Form.Item label="Colours" name="colours" initialValue={[]}>
            <Select
              mode="tags"
              options={colorOptions}
              placeholder="Select or type custom colours"
            />
          </Form.Item>

          <Form.Item label="Add Image URLs">
            <Space.Compact className="w-full">
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
            <div className="mt-2 w-full">
              {imageUrls.map((url) => (
                <Tooltip title={url} key={url}>
                  <Tag
                    closable
                    onClose={() => handleRemoveImageUrl(url)}
                    className="mb-1 max-w-full overflow-hidden whitespace-nowrap align-middle">
                    {url}
                  </Tag>
                </Tooltip>
              ))}
            </div>
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

      <h3 className="text-xl font-semibold mt-8 mb-4">Phone List</h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {phoneList?.map((phone: Phone) => (
          <div
            key={phone.id}
            className="border rounded-xl shadow-sm p-4 bg-white">
            <img
              alt={phone.title}
              src={
                phone.image[0] ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              className="h-48 w-full object-contain mb-4"
            />
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-medium">{phone.title}</h4>
              <span className="text-green-600 font-semibold">
                ${phone.price}
              </span>
            </div>
            <p className="text-gray-500 mb-2">
              Delivery: {phone.hasDelivery ? "Available" : "Not Available"}
            </p>
            <div className="mb-2">
              <span className="font-semibold">Memories: </span>
              {phone.memories.length > 0 ? (
                phone.memories.map((mem) => (
                  <Tag color="blue" key={mem}>{`${mem} GB`}</Tag>
                ))
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Colours: </span>
              {phone.colours.length > 0 ? (
                phone.colours.map((color) => <Tag key={color}>{color}</Tag>)
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="link" onClick={() => handleEdit(phone)}>
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this phone?"
                onConfirm={() => deletePhone.mutate(phone.id)}
                okText="Yes"
                cancelText="No">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={
                    deletePhone.isPending && deletePhone.variables === phone.id
                  }
                />
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhoneManager;
