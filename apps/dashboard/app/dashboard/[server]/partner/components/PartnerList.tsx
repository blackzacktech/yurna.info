"use client";

import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/Buttons";
import { Block } from "@/components/ui/Block";
import { Icons, iconVariants } from "@/components/ui/Icons";
import { Input, Textarea } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Erweiterte Typdefinition für Partner mit Stats
type GuildPartner = {
  id: string;
  guildId: string;
  name: string;
  description: string | null;
  hasBanner: boolean;
  hasPosters: boolean;
  partnerGuildId: string | null;
  partnershipDate: Date;
  notes: string | null;
  tags: string[];
  publicLink: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PartnerWithStats = GuildPartner & {
  partnerStats?: {
    hasYurna: boolean;
    userCount?: number;
    partnershipDays: number;
  };
  partnerGuild?: {
    guildId: string;
    memberCount?: number;
    createdAt?: Date;
  } | null;
};

export const PartnerList = ({
  serverId,
  partners,
}: {
  serverId: string;
  partners: PartnerWithStats[];
}) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPartner, setNewPartner] = useState<{
    name: string;
    description: string;
    partnerGuildId: string;
    notes: string;
    tags: string[];
    publicLink: string;
  }>({
    name: "",
    description: "",
    partnerGuildId: "",
    notes: "",
    tags: [],
    publicLink: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosterFile, setSelectedPosterFile] = useState<File | null>(null);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [partnerNotes, setPartnerNotes] = useState<string[]>([]);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [editPartner, setEditPartner] = useState<{
    name: string;
    description: string;
    partnerGuildId: string;
    notes: string;
    tags: string[];
    publicLink: string;
  }>({
    name: "",
    description: "",
    partnerGuildId: "",
    notes: "",
    tags: [],
    publicLink: "",
  });
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editSelectedPosterFile, setEditSelectedPosterFile] = useState<File | null>(null);

  const handleAddPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPartner.name) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", newPartner.name);
    formData.append("description", newPartner.description || "");
    if (newPartner.partnerGuildId) {
      formData.append("partnerGuildId", newPartner.partnerGuildId);
    }
    
    // Compile notes into a JSON string if there are any custom notes
    if (showNotesInput && partnerNotes.length > 0) {
      const filteredNotes = partnerNotes.filter(note => note.trim() !== "");
      if (filteredNotes.length > 0) {
        formData.append("notes", JSON.stringify(filteredNotes));
      }
    } else if (newPartner.notes) {
      formData.append("notes", newPartner.notes);
    }
    
    if (newPartner.tags.length > 0) {
      formData.append("tags", JSON.stringify(newPartner.tags));
    }
    
    if (newPartner.publicLink) {
      formData.append("publicLink", newPartner.publicLink);
    }
    
    if (selectedFile) {
      formData.append("banner", selectedFile);
    }
    if (selectedPosterFile) {
      formData.append("posters", selectedPosterFile);
    }

    try {
      const response = await fetch(`/api/partners/${serverId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNewPartner({ name: "", description: "", partnerGuildId: "", notes: "", tags: [], publicLink: "" });
        setSelectedFile(null);
        setSelectedPosterFile(null);
        setIsAdding(false);
        setShowNotesInput(false);
        setPartnerNotes([]);
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Error adding partner: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding partner:", error);
      alert("Error adding partner. Please try again.");
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
    if (editPartner.partnerGuildId) {
      formData.append("partnerGuildId", editPartner.partnerGuildId);
    }
    if (editPartner.notes) {
      formData.append("notes", editPartner.notes);
    }
    if (editPartner.tags.length > 0) {
      formData.append("tags", JSON.stringify(editPartner.tags));
    }
    if (editPartner.publicLink) {
      formData.append("publicLink", editPartner.publicLink);
    }
    if (editSelectedFile) {
      formData.append("banner", editSelectedFile);
    }
    if (editSelectedPosterFile) {
      formData.append("posters", editSelectedPosterFile);
    }

    try {
      const response = await fetch(`/api/partners/${serverId}/${partnerId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setEditPartner({ name: "", description: "", partnerGuildId: "", notes: "", tags: [], publicLink: "" });
        setEditSelectedFile(null);
        setEditSelectedPosterFile(null);
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

  const startEditing = (partner: PartnerWithStats) => {
    setEditingPartnerId(partner.id);
    setEditPartner({
      name: partner.name,
      description: partner.description || "",
      partnerGuildId: partner.partnerGuild?.guildId || "",
      notes: partner.notes || "",
      tags: partner.tags || [],
      publicLink: partner.publicLink || "",
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
                <label htmlFor="edit-partner-guild-id" className="mb-1 block text-sm font-medium">
                  Partner Guild ID
                </label>
                <Input
                  id="edit-partner-guild-id"
                  value={editPartner.partnerGuildId}
                  onChange={(e) => setEditPartner({ ...editPartner, partnerGuildId: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="edit-notes" className="mb-1 block text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="edit-notes"
                  value={editPartner.notes}
                  onChange={(e) => setEditPartner({ ...editPartner, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="edit-tags" className="mb-1 block text-sm font-medium">
                  Tags
                </label>
                <Input
                  id="edit-tags"
                  type="text"
                  value={editPartner.tags.join(", ")}
                  onChange={(e) => setEditPartner({ ...editPartner, tags: e.target.value.split(", ") })}
                />
              </div>
              <div>
                <label htmlFor="edit-public-link" className="mb-1 block text-sm font-medium">
                  Public Link
                </label>
                <Input
                  id="edit-public-link"
                  type="text"
                  value={editPartner.publicLink}
                  onChange={(e) => setEditPartner({ ...editPartner, publicLink: e.target.value })}
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
              <div>
                <label htmlFor="edit-poster" className="mb-1 block text-sm font-medium">
                  Poster Image
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-poster"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditSelectedPosterFile(e.target.files?.[0] || null)}
                  />
                  {partner.hasPosters && !editSelectedPosterFile && (
                    <span className="text-xs text-neutral-400">Current poster will be kept if no new image is selected</span>
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
                    className={cn(buttonVariants({ variant: "red", size: "icon" }))}
                  >
                    <Icons.Trash className={iconVariants({ variant: "button" })} />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-row gap-4">
                {partner.hasBanner && (
                  <div className="shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={`/server/${serverId}/${partner.id}/banner.png`}
                      alt={`${partner.name} banner`}
                      width={120}
                      height={60}
                      className="h-auto w-[120px] object-cover"
                    />
                  </div>
                )}
                {partner.hasPosters && (
                  <div className="shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={`/server/${serverId}/${partner.id}/posters.png`}
                      alt={`${partner.name} poster`}
                      width={120}
                      height={60}
                      className="h-auto w-[120px] object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  {partner.description && <p className="text-neutral-300">{partner.description}</p>}
                  
                  {/* Partnerstatistiken hinzufügen */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                      <Icons.CalendarDays className={iconVariants({ variant: "small" })} />
                      <span className="ml-1">{partner.partnerStats?.partnershipDays || 0} Tage Partnerschaft</span>
                    </div>
                    
                    {partner.partnerStats?.hasYurna && (
                      <>
                        <div className="inline-flex items-center rounded-md bg-green-500/20 px-2 py-1 text-xs text-green-400">
                          <Icons.Check className={iconVariants({ variant: "small" })} />
                          <span className="ml-1">Nutzt Yurna Bot</span>
                        </div>
                        
                        {partner.partnerStats.userCount !== undefined && (
                          <div className="inline-flex items-center rounded-md bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
                            <Icons.Users className={iconVariants({ variant: "small" })} />
                            <span className="ml-1">{partner.partnerStats.userCount} Nachrichten</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Notes */}
                  {partner.notes && (
                    <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-2">
                      <div className="flex items-center text-xs text-neutral-400">
                        <Icons.FileText className={iconVariants({ variant: "small" })} />
                        <span className="ml-1 font-medium">Notes:</span>
                      </div>
                      {(() => {
                        try {
                          const parsedNotes = JSON.parse(partner.notes);
                          if (Array.isArray(parsedNotes)) {
                            return (
                              <div className="mt-1">
                                {parsedNotes.map((note, index) => (
                                  <p key={index} className="text-sm text-neutral-300">{note}</p>
                                ))}
                              </div>
                            );
                          }
                          return <p className="mt-1 text-sm text-neutral-300">{partner.notes}</p>;
                        } catch (error) {
                          return <p className="mt-1 text-sm text-neutral-300">{partner.notes}</p>;
                        }
                      })()}
                    </div>
                  )}
                  
                  {/* Partnership Information (only if bot is on partner server) */}
                  {partner.partnerGuildId && partner.partnerGuild && (
                    <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-2">
                      <div className="flex items-center text-xs text-neutral-400">
                        <Icons.Info className={iconVariants({ variant: "small" })} />
                        <span className="ml-1 font-medium">Server Information:</span>
                      </div>
                      
                      <div className="mt-2 space-y-1.5">
                        {/* Partnership date */}
                        <div className="flex items-center text-xs">
                          <Icons.Calendar className={iconVariants({ variant: "small" })} />
                          <span className="ml-1 text-neutral-300">Partner seit: {new Date(partner.partnershipDate).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Member count */}
                        {partner.partnerGuild.memberCount && (
                          <div className="flex items-center text-xs">
                            <Icons.Users className={iconVariants({ variant: "small" })} />
                            <span className="ml-1 text-neutral-300">Mitglieder: {partner.partnerGuild.memberCount.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {/* Server creation date */}
                        {partner.partnerGuild.createdAt && (
                          <div className="flex items-center text-xs">
                            <Icons.Clock className={iconVariants({ variant: "small" })} />
                            <span className="ml-1 text-neutral-300">Erstellt am: {new Date(partner.partnerGuild.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {partner.tags && partner.tags.length > 0 && (
                    <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-2">
                      <div className="flex items-center text-xs text-neutral-400">
                        <Icons.Tag className={iconVariants({ variant: "small" })} />
                        <span className="ml-1 font-medium">Tags:</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {partner.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Public Link */}
                  {partner.publicLink && (
                    <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-2">
                      <div className="flex items-center text-xs text-neutral-400">
                        <Icons.Link className={iconVariants({ variant: "small" })} />
                        <span className="ml-1 font-medium">Public Link:</span>
                      </div>
                      <a 
                        href={partner.publicLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm text-blue-400 hover:underline"
                      >
                        {partner.publicLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>
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
              <label htmlFor="partner-partner-guild-id" className="mb-1 block text-sm font-medium">
                Partner Guild ID
              </label>
              <Input
                id="partner-partner-guild-id"
                value={newPartner.partnerGuildId}
                onChange={(e) => setNewPartner({ ...newPartner, partnerGuildId: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="partner-notes" className="mb-1 block text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="partner-notes"
                value={newPartner.notes}
                onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="partner-tags" className="mb-1 block text-sm font-medium">
                Tags
              </label>
              <Input
                id="partner-tags"
                type="text"
                value={newPartner.tags.join(", ")}
                onChange={(e) => setNewPartner({ ...newPartner, tags: e.target.value.split(", ") })}
              />
            </div>
            <div>
              <label htmlFor="partner-public-link" className="mb-1 block text-sm font-medium">
                Public Link
              </label>
              <Input
                id="partner-public-link"
                type="text"
                value={newPartner.publicLink}
                onChange={(e) => setNewPartner({ ...newPartner, publicLink: e.target.value })}
              />
            </div>
            {showNotesInput && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Additional Notes
                </label>
                {partnerNotes.map((note, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={note}
                      onChange={(e) => {
                        const newNotes = [...partnerNotes];
                        newNotes[index] = e.target.value;
                        setPartnerNotes(newNotes);
                      }}
                    />
                    <Button
                      type="button"
                      variant="red"
                      size="icon"
                      onClick={() => {
                        const newNotes = [...partnerNotes];
                        newNotes.splice(index, 1);
                        setPartnerNotes(newNotes);
                      }}
                    >
                      <Icons.Trash className={iconVariants({ variant: "button" })} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="primary"
                  size="icon"
                  onClick={() => setPartnerNotes([...partnerNotes, ""])}
                >
                  <Icons.Plus className={iconVariants({ variant: "button" })} />
                </Button>
              </div>
            )}
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowNotesInput(!showNotesInput)}
              >
                {showNotesInput ? "Hide Additional Notes" : "Show Additional Notes"}
              </Button>
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
            <div>
              <label htmlFor="partner-poster" className="mb-1 block text-sm font-medium">
                Poster Image (Optional)
              </label>
              <Input
                id="partner-poster"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedPosterFile(e.target.files?.[0] || null)}
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
