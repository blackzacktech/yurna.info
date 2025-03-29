"use client";

import React, { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/Buttons";
import { Block } from "@/components/ui/Block";
import { Icons, iconVariants } from "@/components/ui/Icons";
import { Input, Textarea } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

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
  const [partnerNotes, setPartnerNotes] = useState<string[]>([]);
  const [editPartnerNotes, setEditPartnerNotes] = useState<string[]>([]);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [editShowNotesInput, setEditShowNotesInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editTagInput, setEditTagInput] = useState("");
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
  const [noteInput, setNoteInput] = useState("");
  const [editNoteInput, setEditNoteInput] = useState("");

  // Initialize the toast component
  const { toast } = useToast();

  // Timestamp State für Bild-Refresh hinzufügen
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());

  // Funktion zum Aktualisieren des Timestamps
  const updateImageTimestamp = () => {
    setImageTimestamp(Date.now());
  };

  // Aktualisiere Timestamp nach erfolgreicher Partner-Aktion
  useEffect(() => {
    if (!isSubmitting) {
      updateImageTimestamp();
    }
  }, [isSubmitting]);

  // Function to copy image URL to clipboard
  const copyImageUrlToClipboard = (partnerId: string, type: "banner" | "poster") => {
    const baseUrl = window.location.origin;
    // Verwende die /server/... Route statt der /api/... Route
    const imageUrl = `${baseUrl}/server/${serverId}/${partnerId}/${type}.png?timestamp=${imageTimestamp}`;
    
    navigator.clipboard.writeText(imageUrl)
      .then(() => {
        toast({
          title: "URL kopiert",
          description: `Die Bild-URL wurde in die Zwischenablage kopiert.`,
          variant: "success",
        });
      })
      .catch((error) => {
        console.error("Failed to copy URL:", error);
        toast({
          title: "Fehler",
          description: "Die URL konnte nicht kopiert werden.",
          variant: "destructive",
        });
      });
  };
  
  // Image preview URLs for new partner
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  
  // Image preview URLs for edit partner
  const [editBannerPreviewUrl, setEditBannerPreviewUrl] = useState<string | null>(null);
  const [editPosterPreviewUrl, setEditPosterPreviewUrl] = useState<string | null>(null);
  
  // Handle Banner file change
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreviewUrl(url);
    }
  };

  // Handle Poster file change
  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPosterFile(file);
      const url = URL.createObjectURL(file);
      setPosterPreviewUrl(url);
    }
  };

  // Handle Edit Banner file change
  const handleEditBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);
      const url = URL.createObjectURL(file);
      setEditBannerPreviewUrl(url);
    }
  };

  // Handle Edit Poster file change
  const handleEditPosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedPosterFile(file);
      const url = URL.createObjectURL(file);
      setEditPosterPreviewUrl(url);
    }
  };
  
  // Set edit preview URLs when a partner is selected for editing
  useEffect(() => {
    if (editingPartnerId) {
      const partner = partners.find(p => p.id === editingPartnerId);
      if (partner) {
        if (partner.hasBanner) {
          setEditBannerPreviewUrl(`/server/${serverId}/${partner.id}/banner.png?timestamp=${imageTimestamp}`);
        } else {
          setEditBannerPreviewUrl(null);
        }
        
        if (partner.hasPosters) {
          setEditPosterPreviewUrl(`/server/${serverId}/${partner.id}/poster.png?timestamp=${imageTimestamp}&type=poster`);
        } else {
          setEditPosterPreviewUrl(null);
        }
      }
    } else {
      setEditBannerPreviewUrl(null);
      setEditPosterPreviewUrl(null);
    }
  }, [editingPartnerId, partners, serverId, imageTimestamp]);
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
      if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
      if (editBannerPreviewUrl && editBannerPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editBannerPreviewUrl);
      }
      if (editPosterPreviewUrl && editPosterPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editPosterPreviewUrl);
      }
    };
  }, [bannerPreviewUrl, posterPreviewUrl, editBannerPreviewUrl, editPosterPreviewUrl]);

  const addNote = () => {
    if (noteInput.trim() !== "" && partnerNotes.length < 20) {
      setPartnerNotes([...partnerNotes, noteInput]);
      setNoteInput("");
    }
  };

  const removeNote = (index: number) => {
    const newNotes = [...partnerNotes];
    newNotes.splice(index, 1);
    setPartnerNotes(newNotes);
  };

  const addEditNote = () => {
    if (editNoteInput.trim() !== "" && editPartnerNotes.length < 20) {
      setEditPartnerNotes([...editPartnerNotes, editNoteInput]);
      setEditNoteInput("");
    }
  };

  const removeEditNote = (index: number) => {
    const newNotes = [...editPartnerNotes];
    newNotes.splice(index, 1);
    setEditPartnerNotes(newNotes);
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!newPartner.name) {
      alert("Partner name is required");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", newPartner.name);
    if (newPartner.description) {
      formData.append("description", newPartner.description);
    }
    if (newPartner.partnerGuildId) {
      formData.append("partnerGuildId", newPartner.partnerGuildId);
    }
    
    // Convert notes array to JSON if there are notes
    if (partnerNotes.length > 0) {
      formData.append("notes", JSON.stringify(partnerNotes));
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
        setPartnerNotes([]);
        setTagInput("");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Error adding partner:", errorData);
        alert(`Error adding partner: ${errorData.message || errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding partner:", error);
      alert("Error adding partner. Please try again.");
    }

    setIsSubmitting(false);
    updateImageTimestamp();
  };
  
  const handleEditPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPartner.name) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("name", editPartner.name);
      formData.append("description", editPartner.description || "");
      formData.append("partnerGuildId", editPartner.partnerGuildId || "");
      formData.append("tags", JSON.stringify(editPartner.tags));
      formData.append("notes", JSON.stringify(editPartnerNotes));
      formData.append("publicLink", editPartner.publicLink || "");

      if (editSelectedFile) {
        formData.append("banner", editSelectedFile);
      }

      if (editSelectedPosterFile) {
        formData.append("posters", editSelectedPosterFile);
      }

      const res = await fetch(`/api/partners/${serverId}/${editingPartnerId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save partner");

      toast({
        title: "Partner aktualisiert",
        description: "Der Partner wurde erfolgreich aktualisiert.",
        variant: "success",
      });
      
      // Aktualisiere Bilder durch Timestamp-Refresh
      updateImageTimestamp();
      
      setEditingPartnerId(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating partner:", error);
      toast({
        title: "Fehler",
        description: "Partner konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
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

  // Initialize partnerNotes from existing notes when editing
  const startEditing = (partner: GuildPartner & { partnerGuild?: { guildId: string } | null }) => {
    setEditingPartnerId(partner.id);
    setEditPartner({
      name: partner.name,
      description: partner.description || "",
      partnerGuildId: partner.partnerGuildId || "",
      notes: partner.notes || "",
      tags: partner.tags || [],
      publicLink: partner.publicLink || "",
    });
    
    // Initialize notes
    if (partner.notes) {
      try {
        const parsedNotes = JSON.parse(partner.notes);
        if (Array.isArray(parsedNotes)) {
          setEditPartnerNotes(parsedNotes);
        } else {
          setEditPartnerNotes([partner.notes]);
        }
      } catch (error) {
        setEditPartnerNotes(partner.notes ? [partner.notes] : []);
      }
    } else {
      setEditPartnerNotes([]);
    }
    
    setEditSelectedFile(null);
    setEditSelectedPosterFile(null);
  };

  // Auto-fill public link when partner server is selected
  const handlePartnerServerChange = async (partnerGuildId: string) => {
    if (!partnerGuildId) {
      setNewPartner(prev => ({ ...prev, partnerGuildId: "", publicLink: "" }));
      return;
    }
    
    setNewPartner(prev => ({ ...prev, partnerGuildId }));
    
    // Auto-fill public link if available
    try {
      const response = await fetch(`/api/guilds/${partnerGuildId}`);
      if (response.ok) {
        const guildData = await response.json();
        if (guildData && guildData.inviteUrl) {
          setNewPartner(prev => ({ ...prev, publicLink: guildData.inviteUrl }));
        }
      }
    } catch (error) {
      console.error("Error fetching partner guild data:", error);
    }
  };
  
  // Auto-fill public link when partner server is selected in edit mode
  const handleEditPartnerServerChange = async (partnerGuildId: string) => {
    if (!partnerGuildId) {
      setEditPartner(prev => ({ ...prev, partnerGuildId: "", publicLink: "" }));
      return;
    }
    
    setEditPartner(prev => ({ ...prev, partnerGuildId }));
    
    // Auto-fill public link if available
    try {
      const response = await fetch(`/api/guilds/${partnerGuildId}`);
      if (response.ok) {
        const guildData = await response.json();
        if (guildData && guildData.inviteUrl) {
          setEditPartner(prev => ({ ...prev, publicLink: guildData.inviteUrl }));
        }
      }
    } catch (error) {
      console.error("Error fetching partner guild data:", error);
    }
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
            <form onSubmit={(e) => handleEditPartner(e)} className="space-y-4">
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
                  Beschreibung
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
                  Partner Server ID (optional)
                </label>
                <Input
                  id="edit-partner-guild-id"
                  value={editPartner.partnerGuildId}
                  onChange={(e) => handleEditPartnerServerChange(e.target.value)}
                  placeholder="Discord Server ID (wenn verfügbar)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Notizen (maximal 20)
                </label>
                {editPartnerNotes.map((note, index) => (
                  <div key={index} className="mb-2 flex items-center space-x-2">
                    <textarea
                      value={note}
                      onChange={(e) => {
                        const newNotes = [...editPartnerNotes];
                        newNotes[index] = e.target.value;
                        setEditPartnerNotes(newNotes);
                      }}
                      className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="red"
                      size="icon"
                      onClick={() => removeEditNote(index)}
                    >
                      <Icons.Trash className={iconVariants({ variant: "button" })} />
                    </Button>
                  </div>
                ))}
                {editPartnerNotes.length < 20 && (
                  <div className="flex items-center space-x-2">
                    <textarea
                      value={editNoteInput}
                      onChange={(e) => setEditNoteInput(e.target.value)}
                      className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Add a new note..."
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="icon"
                      onClick={addEditNote}
                    >
                      <Icons.Plus className={iconVariants({ variant: "button" })} />
                    </Button>
                  </div>
                )}
                {editPartnerNotes.length >= 20 && (
                  <p className="text-xs text-yellow-500">Maximum of 20 notes reached</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tags (maximal 20)
                </label>
                <div className="mb-2 flex items-center space-x-2">
                  <Input
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    placeholder="Neuen Tag eingeben"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="icon"
                    onClick={() => {
                      if (editTagInput.trim() !== "") {
                        setEditPartner({ ...editPartner, tags: [...editPartner.tags, editTagInput] });
                        setEditTagInput("");
                      }
                    }}
                  >
                    <Icons.Plus className={iconVariants({ variant: "button" })} />
                  </Button>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {editPartner.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="text-neutral-400 hover:text-destructive"
                        onClick={() => {
                          const newTags = [...editPartner.tags];
                          newTags.splice(index, 1);
                          setEditPartner({ ...editPartner, tags: newTags });
                        }}
                      >
                        <Icons.X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Public Link - only shown when there is a partner server */}
              {editPartner.partnerGuildId && (
                <div>
                  <label htmlFor="edit-public-link" className="mb-1 block text-sm font-medium">
                    Öffentlicher Link
                  </label>
                  <Input
                    id="edit-public-link"
                    type="text"
                    value={editPartner.publicLink}
                    onChange={(e) => setEditPartner({ ...editPartner, publicLink: e.target.value })}
                    placeholder="Wird automatisch ausgefüllt, wenn verfügbar"
                  />
                </div>
              )}
              {/* Banner Image with Copy URL button */}
              <div>
                <label htmlFor="edit-banner" className="mb-1 block text-sm font-medium">
                  Banner Bild
                </label>
                <div className="mb-2">
                  <Input
                    id="edit-banner"
                    type="file"
                    accept="image/*"
                    onChange={handleEditBannerChange}
                  />
                  {partner.hasBanner && !editSelectedFile && (
                    <span className="text-xs text-neutral-400">Aktuelles Banner wird beibehalten, wenn kein neues Bild ausgewählt wird</span>
                  )}
                </div>
                
                {/* Banner Preview with Copy URL button */}
                {editBannerPreviewUrl && (
                  <div className="mb-2 mt-2">
                    <div className="relative overflow-hidden rounded-md">
                      <Image
                        src={editBannerPreviewUrl}
                        alt="Banner Vorschau"
                        width={640}
                        height={160}
                        className="h-40 w-full object-cover"
                      />
                      {partner.hasBanner && (
                        <div className="absolute bottom-2 right-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => copyImageUrlToClipboard(partner.id, "banner")}
                          >
                            <Icons.Copy className="mr-1 h-4 w-4" />
                            Bild-URL kopieren
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Poster Image with Copy URL button */}
              <div>
                <label htmlFor="edit-poster" className="mb-1 block text-sm font-medium">
                  Poster Bild
                </label>
                <div className="mb-2">
                  <Input
                    id="edit-poster"
                    type="file"
                    accept="image/*"
                    onChange={handleEditPosterChange}
                  />
                  {partner.hasPosters && !editSelectedPosterFile && (
                    <span className="text-xs text-neutral-400">Aktuelles Poster wird beibehalten, wenn kein neues Bild ausgewählt wird</span>
                  )}
                </div>
                
                {/* Poster Preview with Copy URL button */}
                {editPosterPreviewUrl && (
                  <div className="mb-2 mt-2">
                    <div className="relative overflow-hidden rounded-md">
                      <Image
                        src={editPosterPreviewUrl}
                        alt="Poster Vorschau"
                        width={640}
                        height={160}
                        className="h-40 w-full object-cover"
                      />
                      {partner.hasPosters && (
                        <div className="absolute bottom-2 right-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => copyImageUrlToClipboard(partner.id, "poster")}
                          >
                            <Icons.Copy className="mr-1 h-4 w-4" />
                            Bild-URL kopieren
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                {/* Partner card with improved image display and copy button */}
                <div className="flex flex-col">
                  {/* Server Banner */}
                  {partner.hasBanner && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={`/server/${serverId}/${partner.id}/banner.png?timestamp=${imageTimestamp}`}
                        alt={`${partner.name} Banner`}
                        width={640}
                        height={160}
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => copyImageUrlToClipboard(partner.id, "banner")}
                        >
                          <Icons.Copy className="mr-1 h-4 w-4" />
                          Bild-URL
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Server Poster */}
                  {partner.hasPosters && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={`/server/${serverId}/${partner.id}/poster.png?timestamp=${imageTimestamp}`}
                        alt={`${partner.name} Poster`}
                        width={640}
                        height={160}
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => copyImageUrlToClipboard(partner.id, "poster")}
                        >
                          <Icons.Copy className="mr-1 h-4 w-4" />
                          Bild-URL
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
            {/* Partner Name */}
            <div>
              <label htmlFor="partner-name" className="mb-1 block text-sm font-medium">
                Partner Name
              </label>
              <Input
                id="partner-name"
                value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                placeholder="Name des Partners"
              />
            </div>
            
            {/* Partner Description */}
            <div>
              <label htmlFor="partner-description" className="mb-1 block text-sm font-medium">
                Beschreibung
              </label>
              <Textarea
                id="partner-description"
                value={newPartner.description}
                onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                placeholder="Beschreibung des Partners"
              />
            </div>
            
            {/* Partner Server */}
            <div>
              <label htmlFor="partner-partner-guild-id" className="mb-1 block text-sm font-medium">
                Partner Server ID (optional)
              </label>
              <Input
                id="partner-partner-guild-id"
                value={newPartner.partnerGuildId}
                onChange={(e) => handlePartnerServerChange(e.target.value)}
                placeholder="Discord Server ID (wenn verfügbar)"
              />
            </div>
            
            {/* Tags */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Tags (maximal 20)
              </label>
              <div className="mb-2 flex items-center space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Neuen Tag eingeben"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (tagInput.trim() !== "") {
                      setNewPartner({ ...newPartner, tags: [...newPartner.tags, tagInput] });
                      setTagInput("");
                    }
                  }}
                  disabled={tagInput.trim() === "" || newPartner.tags.length >= 20}
                >
                  <Icons.Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Display tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {newPartner.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-destructive"
                      onClick={() => {
                        const newTags = [...newPartner.tags];
                        newTags.splice(index, 1);
                        setNewPartner({ ...newPartner, tags: newTags });
                      }}
                    >
                      <Icons.X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Notes */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Notizen (maximal 20)
              </label>
              <div className="mb-2 flex items-center space-x-2">
                <Input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Neue Notiz eingeben"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addNote}
                  disabled={noteInput.trim() === "" || partnerNotes.length >= 20}
                >
                  <Icons.Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Display notes */}
              <div className="mb-4 space-y-2">
                {partnerNotes.map((note, index) => (
                  <div key={index} className="flex items-center justify-between rounded bg-background p-2">
                    <p className="text-sm">{note}</p>
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-destructive"
                      onClick={() => removeNote(index)}
                    >
                      <Icons.Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Public Link - only shown when there is a partner server */}
            {newPartner.partnerGuildId && (
              <div>
                <label htmlFor="partner-public-link" className="mb-1 block text-sm font-medium">
                  Öffentlicher Link
                </label>
                <Input
                  id="partner-public-link"
                  type="text"
                  value={newPartner.publicLink}
                  onChange={(e) => setNewPartner({ ...newPartner, publicLink: e.target.value })}
                  placeholder="Wird automatisch ausgefüllt, wenn verfügbar"
                />
              </div>
            )}
            
            {/* Banner Image */}
            <div>
              <label htmlFor="partner-banner" className="mb-1 block text-sm font-medium">
                Banner Bild (Optional)
              </label>
              <div className="mb-2">
                <Input
                  id="partner-banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                />
              </div>
              
              {/* Banner Preview */}
              {bannerPreviewUrl && (
                <div className="mb-2 mt-2">
                  <div className="relative overflow-hidden rounded-md">
                    <Image
                      src={bannerPreviewUrl}
                      alt="Banner Vorschau"
                      width={640}
                      height={160}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Poster Image */}
            <div>
              <label htmlFor="partner-poster" className="mb-1 block text-sm font-medium">
                Poster Bild (Optional)
              </label>
              <div className="mb-2">
                <Input
                  id="partner-poster"
                  type="file"
                  accept="image/*"
                  onChange={handlePosterFileChange}
                />
              </div>
              
              {/* Poster Preview */}
              {posterPreviewUrl && (
                <div className="mb-2 mt-2">
                  <div className="relative overflow-hidden rounded-md">
                    <Image
                      src={posterPreviewUrl}
                      alt="Poster Vorschau"
                      width={640}
                      height={160}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                </div>
              )}
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
