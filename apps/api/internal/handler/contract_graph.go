package handler

import (
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/sorolens/sorolens/apps/api/internal/store"
	"github.com/sorolens/sorolens/apps/api/internal/jsonutils"
	"strings"
)

type GraphNode struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type GraphEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
	Count  int    `json:"count"`
}

func (h *Handler) ContractGraph(w http.ResponseWriter, r *http.Request) {
	contractID := chi.URLParam(r, "id")
	if contractID == "" {
		jsonutils.WriteError(w, http.StatusBadRequest, "missing contract id")
		return
	}

	// Actually query invocation traces to extract cross-contract calls
	invocations, _, err := h.Store.ListInvocations(r.Context(), contractID, "", 100, store.InvocationFilters{})
	if err != nil {
		jsonutils.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	edgesMap := make(map[string]int)
	nodesMap := make(map[string]bool)
	nodesMap[contractID] = true

	// Analyze invocation traces by looking for contract IDs in arguments
	for _, inv := range invocations {
		for _, arg := range inv.ArgsDecoded {
			if strArg, ok := arg.(string); ok {
				if strings.HasPrefix(strArg, "C") && len(strArg) == 56 {
					edgesMap[strArg]++
					nodesMap[strArg] = true
				}
			}
		}
	}

	var nodes []GraphNode
	for id := range nodesMap {
		nodes = append(nodes, GraphNode{ID: id, Label: id[:6] + "..." + id[len(id)-4:]})
	}

	var edges []GraphEdge
	for target, count := range edgesMap {
		edges = append(edges, GraphEdge{Source: contractID, Target: target, Count: count})
	}

	jsonutils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"nodes": nodes,
		"edges": edges,
	})
}
