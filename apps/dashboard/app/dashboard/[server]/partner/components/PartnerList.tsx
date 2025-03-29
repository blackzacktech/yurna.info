"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/Buttons";
import { Block } from "@/components/ui/Block";
import { Icons, iconVariants } from "@/components/ui/Icons";
import { Input, Textarea } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { GuildPartner } from "@prisma/client";
import Image from "next/image";

export const PartnerList = ({
  serverId,
  partners,
}: {
  serverId: string;
  partners: GuildPartner[];
}) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [editPartner, setEditPartner] = useState({
    name: "",
    description: "",
  });
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);

  const handleAddPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPartner.name) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", newPartner.name);
    formData.append("description", newPartner.description || "");
    if (selectedFile) {
      formData.append("banner", selectedFile);
    }

    try {
      const response = await fetch(`/api/partners/${serverId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNewPartner({ name: "", description: "" });
        setSelectedFile(null);
        setIsAdding(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error adding partner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPartner = async (e: React.FormEvent<HTMLFormElement>, partnerId: string) => {
    e.preventDefault();
    if (!editPartner.name) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", editPartner.name);
    formData.append("description", editPartner.description || "");
    if (editSelectedFile) {
      formData.append("banner", editSelectedFile);
    }

    try {
      const response = await fetch(`/api/partners/${serverId}/${partnerId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setEditPartner({ name: "", description: "" });
        setEditSelectedFile(null);
        setEditingPartnerId(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating partner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm("Are you sure you want to delete this partner server?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/partners/${serverId}/${partnerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (partner: GuildPartner) => {
    setEditingPartnerId(partner.id);
    setEditPartner({
      name: partner.name,
      description: partner.description || "",
    });
  };

  return (
    <div className="space-y-4">
      {partners.length === 0 && !isAdding && (
        <p className="text-center text-neutral-400">No partner servers added yet.</p>
      )}

      {partners.map((partner) => (
        <Block
          key={partner.id}
          className={editingPartnerId === partner.id ? "border-blue-500" : ""}
        >
          {editingPartnerId === partner.id ? (
            <form onSubmit={(e) => handleEditPartner(e, partner.id)} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium">
                  Partner Server Name
                </label>
                <Input
                  id="edit-name"
                  value={editPartner.name}
                  onChange={(e) => setEditPartner({ ...editPartner, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  value={editPartner.description}
                  onChange={(e) => setEditPartner({ ...editPartner, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="edit-banner" className="mb-1 block text-sm font-medium">
                  Banner Image
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-banner"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditSelectedFile(e.target.files?.[0] || null)}
                  />
                  {partner.hasBanner && !editSelectedFile && (
                    <span className="text-xs text-neutral-400">Current banner will be kept if no new image is selected</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingPartnerId(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">{partner.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(partner)}
                    className={cn(buttonVariants({ variant: "secondary", size: "icon" }))}
                  >
                    <Icons.Edit className={iconVariants({ variant: "button" })} />
                  </button>
                  <button
                    onClick={() => handleDeletePartner(partner.id)}
                    className={cn(buttonVariants({ variant: "danger", size: "icon" }))}
                  >
                    <Icons.Trash className={iconVariants({ variant: "button" })} />
                  </button>
                </div>
              </div>
              {partner.description && <p className="mt-2 text-neutral-300">{partner.description}</p>}
              {partner.hasBanner && (
                <div className="mt-3 overflow-hidden rounded-md">
                  <Image
                    src={`/server/${serverId}/${partner.id}/banner.png`}
                    alt={`${partner.name} banner`}
                    width={800}
                    height={200}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </Block>
      ))}

      {isAdding ? (
        <Block className="border-blue-500">
          <form onSubmit={handleAddPartner} className="space-y-4">
            <div>
              <label htmlFor="partner-name" className="mb-1 block text-sm font-medium">
                Partner Server Name
              </label>
              <Input
                id="partner-name"
                value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="partner-description" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="partner-description"
                value={newPartner.description}
                onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                rows={3}
                placeholder="Optional description of the partner server"
              />
            </div>
            <div>
              <label htmlFor="partner-banner" className="mb-1 block text-sm font-medium">
                Banner Image (Optional)
              </label>
              <Input
                id="partner-banner"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAdding(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Partner"}
              </Button>
            </div>
          </form>
        </Block>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="primary"
          className="flex w-full items-center justify-center"
        >
          <Icons.Plus className={iconVariants({ variant: "button" })} />
          Add Partner Server
        </Button>
      )}
    </div>
  );
};
