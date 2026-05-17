
import React from "react";
import { HiOutlineCheck } from "react-icons/hi2";
import { useUserData } from "../../store/userData";
import { MdEdit } from "react-icons/md";


interface Props {  
    chatId: number;
    chatName: string;
}

const EditGroupName = ({ chatId, chatName }: Props) => {
  const [clicked, setClicked] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [newName, setNewName] = React.useState(chatName);
  


  const { token } = useUserData();


 const handleEdit = async () => {
  
  try {
    const res = await fetch(
      `http://localhost:5000/api/chat/${chatId}/name`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Edit failed");
      return;
    }
    alert("Group name updated");


    // 🔥 سيب السوكت يحدث الرسالة
    setEditMode(false);
    setClicked(false);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  return (
    <div >
      <MdEdit 

        onClick={() => setClicked(true)}
        className="cursor-pointer text-muted-foreground transition hover:text-primary"
      />

      {clicked && (
       
    
    
     

            <div onClick={()=>setClicked(false)} className="app-modal-overlay">
            <div onClick={(e) => e.stopPropagation()} className="app-modal-panel flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="app-input flex-1"
              />
              <button type="button" onClick={handleEdit} className="app-btn-primary shrink-0">
                <HiOutlineCheck className="size-4" aria-hidden />
                Save
              </button>
          
          </div>
            </div>
            
       
      

       
      )}
    </div>
  );
};

export default EditGroupName;