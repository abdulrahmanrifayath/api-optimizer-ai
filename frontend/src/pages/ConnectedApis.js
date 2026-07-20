import { useEffect, useState } from "react";

import {
    getConnectedApis,
    createConnectedApi,
    updateConnectedApi,
    deleteConnectedApi,
} from "../services/connectedApiService";

function ConnectedApis() {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        base_url: "",
        description: "",
    });

    const [editingId, setEditingId] = useState(null);

    // ----------------------------
    // Load APIs
    // ----------------------------
    const loadApis = async () => {
        try {
            const data = await getConnectedApis();
            setApis(data);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadApis();
    }, []);

    // ----------------------------
    // Add / Update API
    // ----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateConnectedApi(editingId, form);
            } else {
                await createConnectedApi(form);
            }

            setForm({
                name: "",
                base_url: "",
                description: "",
            });

            setEditingId(null);

            loadApis();
        } catch (err) {
            alert("Operation failed");
            console.error(err);
        }
    };

    // ----------------------------
    // Delete API
    // ----------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this API?")) return;

        try {
            await deleteConnectedApi(id);
            loadApis();
        } catch (err) {
            console.error(err);
        }
    };

    // ----------------------------
    // Edit API
    // ----------------------------
    const handleEdit = (api) => {
        setEditingId(api.id);

        setForm({
            name: api.name,
            base_url: api.base_url,
            description: api.description,
        });
    };

    if (loading) {
        return <h2>Loading Connected APIs...</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>Connected APIs</h1>

            <hr />

            <br />

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="API Name"
                    value={form.name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            name: e.target.value,
                        })
                    }
                />

                <br />
                <br />

                <input
                    placeholder="Base URL"
                    value={form.base_url}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            base_url: e.target.value,
                        })
                    }
                />

                <br />
                <br />

                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            description: e.target.value,
                        })
                    }
                />

                <br />
                <br />

                <button type="submit">
                    {editingId ? "Update API" : "Add API"}
                </button>

                {editingId && (
                    <>
                        {" "}
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);

                                setForm({
                                    name: "",
                                    base_url: "",
                                    description: "",
                                });
                            }}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </form>

            <br />
            <hr />
            <br />

            <table border="1" cellPadding="10" width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Base URL</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {apis.map((api) => (
                        <tr key={api.id}>
                            <td>{api.name}</td>

                            <td>{api.base_url}</td>

                            <td>{api.description}</td>

                            <td>{api.status}</td>

                            <td>
                                <button
                                    onClick={() => handleEdit(api)}
                                >
                                    Edit
                                </button>

                                {" "}

                                <button
                                    onClick={() => handleDelete(api.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ConnectedApis;